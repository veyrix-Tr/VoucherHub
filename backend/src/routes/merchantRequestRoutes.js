import express from "express";
import {createRequest, getAllRequests, approveRequest, rejectRequest, getMyRequest,} from "../controllers/merchantRequestController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/me", protect, getMyRequest);

router.get("/", protect, adminOnly, getAllRequests);
router.put("/:id/approve", protect, adminOnly, approveRequest);
router.put("/:id/reject", protect, adminOnly, rejectRequest);

export default router;
