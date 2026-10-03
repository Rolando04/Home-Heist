import { Agent } from "./agent.js";
import { collectInstitutions, collectLoans } from "./collectors.js";
import { createDbMcpClient } from "./dbMcp.js";
import type { BorrowerProfile } from "./db.js";

export interface RecommendResult {
  institutionsFound: number;
  loansFound: number;
  recommendation: string;
}

/**
 * Main agent flow:
 *  1. Institution agent discovers lenders (grounded web search -> DB)
 *  2. Loan agent discovers their products/rates (grounded web search -> DB)
 *  3. Main agent queries the DB through MCP and synthesizes a
 *     recommendation for the borrower.
 */
export async function recommend(p: BorrowerProfile): Promise<RecommendResult> {
  const institutions = await collectInstitutions(p);
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
