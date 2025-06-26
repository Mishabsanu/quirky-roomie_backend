import express from "express";

import verifyToken from "../middleware/authMiddleware.js";
import {
  createComplaint,
  voteComplaint,
  resolveComplaint,
  getWeeklyTopComplaint,
  getComplaintById,
  getComplaints,
} from "../controllers/complaint.js";

const router = express.Router();

router.post("/add", verifyToken, createComplaint);
router.get("/", verifyToken, getComplaints);
router.post("/:id/vote", verifyToken, voteComplaint);
router.patch("/:id/resolve", verifyToken, resolveComplaint);
router.get("/top-weekly", verifyToken, getWeeklyTopComplaint);
router.get("/:id", verifyToken, getComplaintById);

export default router;
