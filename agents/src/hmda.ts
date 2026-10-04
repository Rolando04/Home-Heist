/**
 * Deterministic lender discovery from public data:
 *   ZIP -> county FIPS (zippopotam.us + Census geocoder)
 *   county FIPS -> HMDA filers (CFPB Data Browser API)
 *
 * All sources are free, key-less public APIs. Every function degrades
 * gracefully — callers should treat empty results as "fall back to the
 * model's own web research".
 */

export interface GeoInfo {
  zip: string;
  stateAbbr: string;
  countyFips: string; // 5-digit state+county FIPS
  countyName: string;
}

export interface HmdaFiler {
  name: string;
  lei?: string;
}

const FETCH_TIMEOUT_MS = 5000;
const quickFetch = (url: string) =>
  fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

/** Resolve a US ZIP to its county FIPS code. Returns null on any failure. */
export async function zipToCounty(zip: string): Promise<GeoInfo | null> {
  try {
    const z = (await (
      await quickFetch(`https://api.zippopotam.us/us/${zip}`)
    ).json()) as {
      places?: { latitude: string; longitude: string; "state abbreviation": string }[];
    };
    const place = z.places?.[0];
    if (!place) return null;

    const url =
      "https://geocoding.geo.census.gov/geocoder/geographies/coordinates" +
      `?x=${place.longitude}&y=${place.latitude}` +
      "&benchmark=Public_AR_Current&vintage=Current_Current&format=json";
    const g = (await (await quickFetch(url)).json()) as {
      result?: {
        geographies?: {
          Counties?: { GEOID: string; NAME: string; STATE: string }[];
        };
      };
    };
    const county = g.result?.geographies?.Counties?.[0];
    if (!county) return null;

    return {
      zip,
      stateAbbr: place["state abbreviation"],
      countyFips: county.GEOID,
      countyName: county.NAME,
    };
  } catch {
    return null;
  }
}

/**
 * Lenders that filed HMDA mortgage data in the given geography.
 * Prefers county-level data when available; falls back to state.
 * Returns [] on any API/network failure (the API has outages).
 */
export async function fetchHmdaFilers(geo: GeoInfo): Promise<HmdaFiler[]> {
  const year = new Date().getFullYear() - 2; // HMDA data lags ~1-2 years
  const attempts = [
    `counties=${geo.countyFips}`,
    `states=${geo.stateAbbr}`,
  ];
  for (const geoParam of attempts) {
    try {
      const res = await quickFetch(
        "https://ffiec.cfpb.gov/v2/data-browser-api/view/filers" +
          `?years=${year}&${geoParam}`,
      );
      if (!res.ok) continue;
      const data = (await res.json()) as unknown;
      const list = Array.isArray(data)
        ? data
        : ((data as { institutions?: unknown[]; filers?: unknown[] })
            .institutions ??
          (data as { filers?: unknown[] }).filers ??
          []);
      const filers: HmdaFiler[] = [];
      for (const item of list) {
        const name =
          (item as { name?: string; institution_name?: string }).name ??
          (item as { institution_name?: string }).institution_name;
        if (name) {
          filers.push({
            name,
            lei: (item as { lei?: string }).lei,
          });
        }
      }
      if (filers.length) return filers;
    } catch {
      continue;
    }
  }
  return [];
}
