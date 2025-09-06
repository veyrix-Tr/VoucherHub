import { ethers } from "ethers";
import Voucher from "../models/Voucher.js";
import merchantRegistryAbi from '../abi/MerchantRegistry.json' with { type: "json" };

export const createVoucher = async (req, res) => {
  try {
    const { voucherData, signature, chainId } = req.body;

    if (!voucherData || !signature) {
      return res.status(400).json({ error: "Missing voucher or signature" });
    }

    const domain = {
      name: "VoucherERC1155",
      version: "1",
      chainId: chainId || 1,
      verifyingContract: process.env.VOUCHER_CONTRACT_ADDRESS,
    };

    const types = {
      VoucherData: [
        { name: "voucherId", type: "uint256" },
        { name: "merchant", type: "address" },
        { name: "maxMint", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "metadataHash", type: "bytes32" },
        { name: "metadataCID", type: "string" },
        { name: "price", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const recovered = ethers.utils.verifyTypedData(domain, types, voucherData, signature);

    if (recovered.toLowerCase() !== voucherData.merchant.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const registry = new ethers.Contract(
      process.env.MERCHANT_REGISTRY_ADDRESS,
      merchantRegistryAbi,
      provider
    );

    const isMerchant = await registry.isMerchant(voucherData.merchant);
    if (!isMerchant) {
      return res.status(403).json({ error: "Not a registered merchant" });
    }

    const exists = await Voucher.findOne({
      $or: [{ voucherId: voucherData.voucherId }, { nonce: voucherData.nonce }]
    });
    if (exists) {
      return res.status(409).json({ error: "Voucher already exists" });
    }

    const newVoucher = new Voucher({
      ...voucherData,
      signature,
      status: "pending"
    });
    await newVoucher.save();

    res.json({ status: "pending", id: newVoucher._id });

  } catch (err) {
    console.error("❌ Error creating voucher:", err);
    res.status(500).json({ error: "Server error" });
  }
}