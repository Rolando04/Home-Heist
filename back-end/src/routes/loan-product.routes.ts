import { Router } from "express";
import {
  createLoanProduct,
  getLoanProductById,
  getLoanProducts,
} from "../controllers/loan-product.controller";

const router = Router();

router.get("/", getLoanProducts);
router.get("/:id", getLoanProductById);
router.post("/", createLoanProduct);

export default router;
