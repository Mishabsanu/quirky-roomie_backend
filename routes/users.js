import express from "express";

import verifyToken from "../middleware/authMiddleware.js";
import { getLeaderboardAndStats } from "../controllers/users.js";

const router = express.Router();

router.get("/karma-leaderboard", verifyToken, getLeaderboardAndStats);

export default router;
