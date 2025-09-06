import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import Voucher from "./src/models/Voucher.js";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import voucherRoutes from "./src/routes/voucherRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use("/api/vouchers", voucherRoutes);

async function testVoucher() {
  const exists = await Voucher.findOne({ voucherId: "1" });
  if (!exists) {
    const demo = new Voucher({
      voucherId: "1",
      merchant: "0x1234abcd...",
      maxMint: "100",
      expiry: "9999999999",
      metadataHash: "0xhash",
      metadataCID: "QmCID",
      price: "1000",
      nonce: "1",
      signature: "0xsignature",
    });
    await demo.save();
    console.log("Demo voucher saved!");
  } else {
    console.log("Demo voucher already exists");
  }
}

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      testVoucher();
    });
  })
};

startServer();
