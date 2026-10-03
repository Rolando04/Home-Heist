import { Agent } from "./agent.js";
import { collectInstitutions, collectLoans } from "./collectors.js";
import { createDbMcpClient } from "./dbMcp.js";
import { fetchHmdaFilers, zipToCounty } from "./hmda.js";
import type { BorrowerProfile } from "./db.js";

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
export async function recommend(p: BorrowerProfile): Promise<RecommendResult> {
  const geo = await zipToCounty(p.zip);
  const filers = geo ? await fetchHmdaFilers(geo) : [];
  const institutions = await collectInstitutions(
    p,
    geo ? { countyName: geo.countyName, stateAbbr: geo.stateAbbr } : null,
    filers.map((f) => f.name),
  );
  const loansFound = await collectLoans(p, institutions);

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

    const recommendation = await main.ask(
      `Borrower: credit score ${p.creditScore}, income $${p.income}, ` +
        `ZIP ${p.zip}, price $${p.propertyPrice}, down $${p.downPayment}, ` +
        `loan amount $${p.loanAmount}` +
        (p.loanType ? `, wants ${p.loanType}` : "") +
        (p.termMonths ? `, ${p.termMonths}-month term` : "") +
        `. Query the database, log this search, then give your recommendation.`,
    );

    return {
      institutionsFound: institutions.length,
      loansFound,
      recommendation,
    };
  } finally {
    await dbClient.close();
  }
}
