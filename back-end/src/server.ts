import express from "express";
import cors from "cors";

import institutionRoutes from "./routes/institution.routes";
import loanProductRoutes from "./routes/loan-product.routes";
import loanSearchRoutes from "./routes/loan-search.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Home-Heist API is running",
  });
});

app.use("/api/institutions", institutionRoutes);
app.use("/api/loan-products", loanProductRoutes);
app.use("/api/loan-searches", loanSearchRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Home-Heist API running on port ${PORT}`);
});
