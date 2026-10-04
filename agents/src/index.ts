import "dotenv/config";
import { recommend } from "./orchestrator.js";
import type { BorrowerProfile } from "./db.js";

// Demo borrower — replace with real form input from the web app.
const profile: BorrowerProfile = {
  income: 95_000,
  creditScore: 710,
  zip: "30308", // Atlanta, GA
  propertyPrice: 350_000,
  downPayment: 35_000,
  loanAmount: 315_000,
  loanType: "30-year fixed",
  termMonths: 360,
};

console.log(
  `Collecting lenders + rates for ZIP ${profile.zip} (credit ${profile.creditScore})...`,
);

const result = await recommend(profile);

console.log(
  `\nFound ${result.institutionsFound} institutions, ${result.loansFound} loan products.\n`,
);
console.log(result.recommendation);
