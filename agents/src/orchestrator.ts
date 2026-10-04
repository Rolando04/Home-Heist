import { Agent } from "./agent.js";
import { collectInstitutions, collectLoans } from "./collectors.js";
import { createDbMcpClient } from "./dbMcp.js";
import { fetchHmdaFilers, zipToCounty } from "./hmda.js";
import { findOrCreateUser, logSearch, searchLoans, type BorrowerProfile } from "./db.js";

export interface RecommendResult {
  institutionsFound: number;
  loansFound: number;
  recommendation: string;
}

/**
 * Main agent flow:
 *  1. Resolve ZIP -> county; pull HMDA filers (who actually lends there).
 *     Falls back silently if the public APIs are unreachable.
 *  2. Institution agent discovers lenders (grounded web search -> DB)
 *  3. Loan agent discovers their products/rates (grounded web search -> DB)
 *  4. Main agent queries the DB through MCP and synthesizes a
 *     recommendation for the borrower.
 */
// Collection cache: once a county (or ZIP) has been researched, later
// searches skip straight to the recommendation. Keeps repeat/demo
// queries fast and avoids re-burning grounding quota.
const COLLECTION_TTL_MS = 60 * 60 * 1000; // 1 hour
const collectedAt = new Map<string, number>();

export async function recommend(
  p: BorrowerProfile,
  email?: string,
): Promise<RecommendResult> {
  const geo = await zipToCounty(p.zip);
  const cacheKey = geo?.countyFips ?? p.zip;
  const fresh =
    Date.now() - (collectedAt.get(cacheKey) ?? 0) < COLLECTION_TTL_MS;

  let institutions: { id: string; name: string }[] = [];
  let loansFound = 0;
  if (!fresh) {
    const filers = geo ? await fetchHmdaFilers(geo) : [];
    institutions = await collectInstitutions(
      p,
      geo ? { countyName: geo.countyName, stateAbbr: geo.stateAbbr } : null,
      filers.map((f) => f.name),
    );
    loansFound = await collectLoans(p, institutions.slice(0, 5));
    if (loansFound > 0) collectedAt.set(cacheKey, Date.now());
  } else {
    console.log(`[orchestrator] county ${cacheKey} fresh — skipping collection`);
  }

  const dbClient = await createDbMcpClient();
  try {
    const main = new Agent({
      name: "recommendation-agent",
      systemInstruction:
        "You are a mortgage advisor for Home-Heist, which surfaces rates " +
        "from lenders borrowers can't easily find on aggregators. Use your " +
        "database tools to compare products, then recommend the best 2-3 " +
        "options. For each: lender, product, APR, estimated monthly " +
        "payment for the borrower's loan amount (P&I), and the product " +
        "link. Explain trade-offs plainly and flag anything missing " +
        "(e.g. unknown credit-score minimums).",
      mcpClients: [dbClient],
    });

    let recommendation: string;
    try {
      recommendation = await main.ask(
        `Borrower: credit score ${p.creditScore}, income $${p.income}, ` +
          `ZIP ${p.zip}, price $${p.propertyPrice}, down $${p.downPayment}, ` +
          `loan amount $${p.loanAmount}` +
          (p.loanType ? `, wants ${p.loanType}` : "") +
          (p.termMonths ? `, ${p.termMonths}-month term` : "") +
          `. Query the database, log this search` +
          (email ? ` (pass email "${email}" to log_search so it links to the user)` : "") +
          `, then give your recommendation.`,
      );
    } catch (e) {
      console.warn(
        `[main-agent] recommendation failed, using deterministic fallback: ` +
          `${(e as Error).message.slice(0, 160)}`,
      );
      recommendation = await fallbackRecommendation(p, email);
    }

    return {
      institutionsFound: institutions.length,
      loansFound,
      recommendation,
    };
  } finally {
    await dbClient.close();
  }
}

/**
 * Last-resort path when Gemini is unreachable: rank DB rows by APR and
 * compute P&I payments directly. Produces a real (if plain) answer so a
 * live demo never dead-ends.
 */
async function fallbackRecommendation(
  p: BorrowerProfile,
  email?: string,
): Promise<string> {
  const userId = email ? await findOrCreateUser(email).catch(() => null) : null;
  await logSearch(userId, p).catch(() => {});
  const rows = await searchLoans({ creditScore: p.creditScore });
  if (!rows.length) return "No loan products in the database.";

  const lines = rows.slice(0, 3).map((r, i) => {
    const payment = r.apr != null ? monthlyPayment(p.loanAmount, r.apr, r.term_months ?? 360) : null;
    return (
      `${i + 1}. **${r.product_name}** — ${r.institution_name ?? "unknown lender"}\n` +
      `   APR ${r.apr ?? "?"}%` +
      (payment != null ? `, est. P&I $${payment.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo` : "") +
      (r.product_link ? `\n   ${r.product_link}` : "")
    );
  });
  return (
    `**Recommendation** (offline fallback — rates from database)\n\n` +
    lines.join("\n\n")
  );
}

function monthlyPayment(principal: number, aprPct: number, months: number): number {
  const r = aprPct / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
