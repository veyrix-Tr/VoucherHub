import { ethers } from "ethers";
import Voucher from "../models/Voucher.js";
import merchantRegistryAbi from '../abi/MerchantRegistry.json' with { type: "json" };

export const createVoucher = async (req, res) => {
  try {
    const { voucher, signature, chainId } = req.body;

    if (!voucher || !signature) {
      return res.status(400).json({ error: "Missing voucher or signature" });
    }

    const domain = {
      name: "VoucherERC1155",
      version: "1",
      chainId: chainId || 11155111,
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
        { name: "nonce", type: "uint256" }
      ],
    };
    const recovered = ethers.utils.verifyTypedData(domain, types, voucher, signature);

    if (recovered.toLowerCase() !== voucher.merchant.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    if (!provider) {
      console.log("error in fetching the provider, may be problem with RPC_URL");
      return
    }
    const registry = new ethers.Contract(
      process.env.MERCHANT_REGISTRY_ADDRESS,
      merchantRegistryAbi,
      provider
    );

    const isMerchant = await registry.isMerchant(voucher.merchant);
    if (!isMerchant) {
      return res.status(403).json({ error: "Not a registered merchant" });
    }

    const exists = await Voucher.findOne({
      $or: [{ voucherId: voucher.voucherId }, { nonce: voucher.nonce }]
    });
    if (exists) {
      return res.status(409).json({ error: "Voucher already exists" });
    }

    const newVoucher = new Voucher({
      ...voucher,
      signature,
      status: "pending"
    });

    await newVoucher.save();

    res.json({ status: "pending", id: newVoucher._id });

  } catch (err) {
    console.error("Error creating voucher:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export const getVouchers = async (req, res) => {
  try {
    const { status, merchant, voucherId, limit = 10, page = 1 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (merchant) filter.merchant = merchant.toLowerCase();
    if (voucherId) filter.voucherId = voucherId;

    const vouchers = await Voucher.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(vouchers);

  } catch (err) {
    console.error("Error fetching vouchers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    res.json(voucher);

  } catch (err) {
    console.error("Error fetching voucher:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const approveVoucher = async (req, res) => {
  try {
    const { txHash } = req.body;
    if (!txHash) {
      return res.status(400).json({ error: "txHash is required" });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    voucher.status = "approved";
    voucher.approvedTxHash = txHash;
    await voucher.save();

    res.json({
      message: "Voucher approved",
      id: voucher._id,
      status: voucher.status,
      txHash: voucher.approvedTxHash,
    });

  } catch (err) {
    console.error("Error approving voucher:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const rejectVoucher = async (req, res) => {
  try {
    const { notes } = req.body;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    voucher.status = "rejected";
    if (notes) voucher.notes = notes;
    await voucher.save();

    res.json({
      message: "Voucher rejected",
      id: voucher._id,
      status: voucher.status,
      notes: voucher.notes,
    });

  } catch (err) {
    console.error("Error rejecting voucher:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const redeemVoucher = async (req, res) => {
  try {
    const { redeemer, txHash, amount } = req.body;
    const voucherId = req.params.id;

    if (!redeemer || !txHash || !amount) {
      return res.status(400).json({ error: "redeemer, txHash, and amount are required" });
    }
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // reduce reduces an array to a single value by applying a function repeatedly to each element
    const totalRedeemed = voucher.redemptions
      ? voucher.redemptions.reduce((sum, r) => sum + r.amount, 0)
      : 0;

    if (totalRedeemed + amount > voucher.maxMint) {
      return res.status(400).json({ error: "Exceeds max mint limit" });
    }
    const redemptionEntry = {
      redeemer: redeemer.toLowerCase(),
      amount,
      txHash,
      redeemedAt: new Date()
    };

    voucher.redemptions = voucher.redemptions || [];
    voucher.redemptions.push(redemptionEntry);

    if (totalRedeemed + amount >= voucher.maxMint) {
      voucher.status = "redeemed";
    }

    await voucher.save();

    res.json({
      message: "Voucher redeemed",
      voucherId: voucher._id,
      status: voucher.status,
      totalRedeemed: totalRedeemed + amount,
      redemption: redemptionEntry
    });

  } catch (err) {
    console.error("Error redeeming voucher:", err);
    res.status(500).json({ error: "Server error" });
  }
};
