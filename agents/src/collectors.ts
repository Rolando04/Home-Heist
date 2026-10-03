import { Agent } from "./agent.js";
import {
  upsertInstitution,
  upsertLoanProduct,
  type BorrowerProfile,
} from "./db.js";

const INSTITUTION_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      institution_name: { type: "string" },
      institution_type: { type: "string" },
      institution_link: { type: "string" },
    },
    required: ["institution_name"],
  },
} as const;

const LOAN_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    properties: {
      institution_name: { type: "string" },
      product_name: { type: "string" },
      loan_type: { type: "string" },
      term_months: { type: "integer" },
      interest_rate: { type: "number" },
      apr: { type: "number" },
      min_credit_score: { type: "integer" },
      max_credit_score: { type: "integer" },
      product_link: { type: "string" },
    },
    required: ["institution_name", "product_name"],
  },
} as const;

interface ExtractedInstitution {
  institution_name: string;
  institution_type?: string;
  institution_link?: string;
}

interface ExtractedLoan {
  institution_name: string;
  product_name: string;
  loan_type?: string;
  term_months?: number;
  interest_rate?: number;
  apr?: number;
  min_credit_score?: number;
  max_credit_score?: number;
  product_link?: string;
}

function describeProfile(p: BorrowerProfile): string {
  return [
    `credit score ${p.creditScore}`,
    `annual income $${p.income.toLocaleString()}`,
    `property in ZIP ${p.zip}`,
    `price $${p.propertyPrice.toLocaleString()}`,
    `down payment $${p.downPayment.toLocaleString()}`,
    `loan amount ~$${p.loanAmount.toLocaleString()}`,
    p.loanType ? `loan type: ${p.loanType}` : null,
    p.termMonths ? `term: ${p.termMonths} months` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Institution Agent: finds mortgage lenders that serve the borrower's
 * area — favoring credit unions, community banks, CDFIs and state housing
 * programs over the big national banks — then persists them. When HMDA
 * filer data is available it anchors the search to lenders that actually
 * originated mortgages in the borrower's county.
 */
export async function collectInstitutions(
  p: BorrowerProfile,
  geo?: { countyName: string; stateAbbr: string } | null,
  hmdaFilers: string[] = [],
): Promise<{ id: string; name: string }[]> {
  const agent = new Agent({
    name: "institution-agent",
    systemInstruction:
      "You research mortgage lenders, especially smaller ones whose rates " +
      "aren't on the big aggregators: credit unions, community banks, " +
      "CDFIs, and state housing finance agencies. Cite real institutions " +
      "with real URLs only.",
  });

  const prompt = hmdaFilers.length
    ? `These lenders filed HMDA mortgage data in ` +
      `${geo?.countyName ?? "the borrower's county"}, ${geo?.stateAbbr ?? ""}: ` +
      `${hmdaFilers.slice(0, 40).join("; ")}.\n` +
      `From that list (and any similar lenders you know serve ZIP ${p.zip}), ` +
      `pick 6-8 that are credit unions, community banks, CDFIs, or state ` +
      `housing finance agency programs — lenders whose rates are NOT easily ` +
      `found on Bankrate/NerdWallet. For each give: name, type, and official ` +
      `website URL.`
    : `Find 6-8 mortgage lenders that serve borrowers in ZIP ${p.zip}. ` +
      `Prioritize credit unions, community banks, CDFIs, and state housing ` +
      `finance agency programs — lenders whose rates are NOT easily found on ` +
      `Bankrate/NerdWallet. For each give: name, type, and official website URL.`;

  const research = await agent.research(prompt);

  const extracted = await agent.extractJson<ExtractedInstitution[]>(
    "Extract the lenders as JSON. Use the official homepage URL.",
    research.text,
    INSTITUTION_SCHEMA,
  );

  const saved: { id: string; name: string }[] = [];
  for (const inst of extracted ?? []) {
    const id = await upsertInstitution({
      institution_name: inst.institution_name,
      institution_type: inst.institution_type ?? null,
      institution_link: inst.institution_link ?? null,
    });
    saved.push({ id, name: inst.institution_name });
  }
  return saved;
}

/**
 * Loan Agent: given the borrower profile and discovered institutions,
 * researches their current mortgage products/rates and persists them.
 */
export async function collectLoans(
  p: BorrowerProfile,
  institutions: { id: string; name: string }[],
): Promise<number> {
  const agent = new Agent({
    name: "loan-agent",
    systemInstruction:
      "You research current mortgage products and rates from specific " +
      "lenders. Report only products with a real published rate or page " +
      "you can point to. Never invent rates.",
  });

  const names = institutions.map((i) => i.name).join(", ");
  const research = await agent.research(
    `Borrower profile: ${describeProfile(p)}.\n` +
      `For each of these lenders: ${names}.\n` +
      `Find their current mortgage products relevant to this borrower ` +
      `(e.g. 30yr fixed, 15yr fixed, FHA, ARM, first-time-buyer programs). ` +
      `Fetch each lender's actual published rates page — do not rely on ` +
      `search snippets. For each product give: lender name, product name, ` +
      `loan type, term in months, interest rate, APR, min/max credit score ` +
      `if stated, and the product page URL.`,
  );

  const extracted = await agent.extractJson<ExtractedLoan[]>(
    "Extract the loan products as JSON. Rates/APR as numbers like 6.375. " +
      "Omit fields not stated in the source.",
    research.text,
    LOAN_SCHEMA,
  );

  const idByName = new Map(
    institutions.map((i) => [i.name.toLowerCase(), i.id]),
  );

  let count = 0;
  for (const loan of extracted ?? []) {
    const institutionId =
      idByName.get(loan.institution_name.toLowerCase()) ??
      (await upsertInstitution({
        institution_name: loan.institution_name,
        institution_type: null,
        institution_link: null,
      }));
    await upsertLoanProduct({
      institution_id: institutionId,
      product_name: loan.product_name,
      loan_type: loan.loan_type ?? null,
      term_months: loan.term_months ?? null,
      interest_rate: loan.interest_rate ?? null,
      apr: loan.apr ?? null,
      min_credit_score: loan.min_credit_score ?? null,
      max_credit_score: loan.max_credit_score ?? null,
      product_link: loan.product_link ?? null,
    });
    count++;
  }
  return count;
}
