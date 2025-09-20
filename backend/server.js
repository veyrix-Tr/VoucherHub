import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import voucherRoutes from "./src/routes/voucherRoutes.js";
import merchantRequestRoutes from "./routes/merchantRequestRoutes.js";


dotenv.config();

const app = express();
app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use("/api/vouchers", voucherRoutes);
app.use("/api/merchant-requests", merchantRequestRoutes);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
};

startServer();
