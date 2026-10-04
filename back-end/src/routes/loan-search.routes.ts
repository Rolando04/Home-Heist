import { Router } from "express";
import {
  createLoanSearch,
  getLoanSearchById,
  getLoanSearches,
} from "../controllers/loan-search.controller";

const router = Router();

router.get("/", getLoanSearches);
router.get("/:id", getLoanSearchById);
router.post("/", createLoanSearch);

export default router;

