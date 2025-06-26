import express from "express";
import { register, login, me } from "../controllers/auth.js";
import verifyToken from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, me);

export default router;
