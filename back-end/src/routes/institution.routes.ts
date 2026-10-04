import { Router } from "express";
import {
  createInstitution,
  getInstitutionById,
  getInstitutions,
} from "../controllers/institution.controller";

const router = Router();

router.get("/", getInstitutions);
router.get("/:id", getInstitutionById);
router.post("/", createInstitution);

export default router;
