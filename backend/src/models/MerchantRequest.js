import mongoose from "mongoose";

const MerchantRequestSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    details: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("MerchantRequest", MerchantRequestSchema);
