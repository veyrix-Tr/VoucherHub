import express from "express";
import { approveVoucher, createVoucher, getVoucherById, getVouchers, redeemVoucher, rejectVoucher } from "../controllers/voucherController.js";

const router = express.Router();

router.post("/", createVoucher);
router.get("/", getVouchers);
router.get("/:id", getVoucherById);
router.put("/:id/redeem", redeemVoucher);
router.put("/:id/approve", approveVoucher);
router.put("/:id/reject", rejectVoucher);

export default router;
