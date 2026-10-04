import { Router } from "express";
import {
  createUser,
  getUserById,
  loginUser,
} from "../controllers/user.controller";

const router = Router();

router.post("/login", loginUser);
router.get("/:id", getUserById);
router.post("/", createUser);

export default router;
