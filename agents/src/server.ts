import "dotenv/config";
import express from "express";
import cors from "cors";
import { recommend } from "./orchestrator.js";
import type { BorrowerProfile } from "./db.js";

const app = express();
const PORT = Number(process.env.AGENTS_PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Body: { income, creditScore, zip, propertyPrice, downPayment,
 *         loanAmount?, loanType?, termMonths? }
 * Returns: { recommendation, institutionsFound, loansFound }
 *
 * Runs the full pipeline (HMDA -> collectors -> main agent over MCP),
 * so expect ~30-90s with live grounding. Falls back to DB rows if the
 * Gemini key/quota is unavailable.
 */
app.post("/recommend", async (req, res) => {
  const b = req.body ?? {};
  const income = Number(b.income);
  const creditScore = Number(b.creditScore);
  const propertyPrice = Number(b.propertyPrice);
  const downPayment = Number(b.downPayment);
  const zip = String(b.zip ?? "");

  if (
    !zip ||
    !Number.isFinite(income) ||
    !Number.isFinite(creditScore) ||
    !Number.isFinite(propertyPrice) ||
    !Number.isFinite(downPayment)
  ) {
    res.status(400).json({
      error:
        "required: income, creditScore, zip, propertyPrice, downPayment " +
        "(numbers, zip as string)",
    });
    return;
  }

  const profile: BorrowerProfile = {
    income,
    creditScore,
    zip,
    propertyPrice,
    downPayment,
    loanAmount: Number.isFinite(Number(b.loanAmount))
      ? Number(b.loanAmount)
      : propertyPrice - downPayment,
    loanType: b.loanType ? String(b.loanType) : undefined,
    termMonths: Number.isFinite(Number(b.termMonths))
      ? Number(b.termMonths)
      : undefined,
  };

  try {
    const result = await recommend(profile);
    res.json(result);
  } catch (e) {
    console.error("[recommend] failed:", e);
    res.status(500).json({ error: "recommendation pipeline failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Home-Heist agent server on http://localhost:${PORT}`);
});
