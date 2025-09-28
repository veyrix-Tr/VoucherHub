import express from "express";
import { approveVoucher, createVoucher, getVoucherById, getVouchers, redeemVoucher, rejectVoucher, updateMinted } from "../controllers/voucherController.js";
import { validateVoucher, validateApprove, validateReject } from "../middleware/validateVoucher.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createVoucher);
router.get("/", protect, getVouchers);
router.get("/:id", protect, getVoucherById);

router.put("/:id/approve", protect, adminOnly, approveVoucher, validateApprove);
router.put("/:id/reject", protect, adminOnly, rejectVoucher, validateReject);

router.put("/:id/redeem", protect, redeemVoucher);
router.put("/:id/minted", protect, updateMinted);

export default router;
