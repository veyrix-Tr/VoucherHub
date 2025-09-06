import express from "express";
import { createVoucher } from "../controllers/voucherController.js";


const router = express.Router();

router.post("/", createVoucher);

export default router;
