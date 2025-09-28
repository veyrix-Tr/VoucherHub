import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  voucherId: { type: String, required: true },
  merchant: { type: String, required: true, lowercase: true },
  maxMint: { type: String, required: true },
  expiry: { type: String, required: true },
  metadataHash: { type: String, required: true },
  metadataCID: { type: String, required: true },
  price: { type: String, required: true },
  nonce: { type: String, required: true },
  signature: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "redeemed"],
    default: "pending"
  },
  approvedTxHash: { type: String },
  notes: { type: String },
  minted: { type: String, default: "0" },
  redemptions: [
    {
      redeemer: { type: String, lowercase: true, required: true },
      amount: { type: Number, required: true },
      txHash: { type: String, required: true },
      redeemedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

voucherSchema.index({ voucherId: 1, nonce: 1 }, { unique: true });
voucherSchema.index({ merchant: 1 });
voucherSchema.index({ status: 1 });

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;