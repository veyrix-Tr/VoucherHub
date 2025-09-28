import { ethers } from "ethers";
import Voucher from "../models/Voucher.js";
import merchantRegistryAbi from '../../../contracts/exports/abi/MerchantRegistry.json' with { type: "json" };
import voucherAbi from '../../../contracts/exports/abi/VoucherERC1155.json' with { type: "json" };
import CONTRACT_ADDRESSES from "../../../contracts/exports/addresses/addresses.js";

export const createVoucher = async (req, res) => {
  try {
    const { voucher, signature, chainId } = req.body;

    if (!voucher || !signature) {
      return res.status(400).json({ error: "Missing voucher or signature" });
    }
    if(chainId){
      if(!CONTRACT_ADDRESSES[chainId]){
        return res.status(400).json({ error: "Invalid chainId" });
      }
    } else{
      chainId = 11155111;
    }

    const domain = {
      name: "VoucherERC1155",
      version: "1",
      chainId: chainId || 11155111,
      verifyingContract: CONTRACT_ADDRESSES[chainId || 11155111].voucherERC1155,
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
      CONTRACT_ADDRESSES[chainId].merchantRegistry,
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
    const { status, merchant, voucherId, owner, limit = 10, page = 1 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (merchant) filter.merchant = merchant.toLowerCase();
    if (voucherId) filter.voucherId = voucherId;

    const chainId = process.env.CHAIN_ID || 11155111;

    let vouchers = await Voucher.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean(); // <--- directly return plain JS objects


    if (owner) {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
      const VOUCHER_CONTRACT_ADDRESS = CONTRACT_ADDRESSES[chainId].voucherERC1155;
      const voucherContract = new ethers.Contract(VOUCHER_CONTRACT_ADDRESS, voucherAbi, provider);

      // due to await can't use map because map doesn’t wait for promises. It just returns an array of promises while 'for...of' runs each iteration sequentially, await pauses until balanceOf finishes.
      /** 
       * balanceOf(owner, v.voucherId) returns a BigNumber (from ethers.js) because token balances can be very large Example: BigNumber { _hex: "0x05", ... } (which means 5)
       * Since it’s a BigNumber, you can’t do balance > 0 directly Instead, ethers.js BigNumber has helper methods like .gt() (greater than), .lt() (less than), .eq() (equal)
        So balance.gt(0) means “is balance greater than 0?”

      */
      const results = [];
      for (const v of vouchers) {
        const balance = await voucherContract.balanceOf(owner, v.voucherId);
        if (balance.gt(0)) {
          results.push({ ...v, balance: balance.toString() });
        }
      }
      vouchers = results;
    }
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
    res.json(voucher.toObject());

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
export const updateMinted = async (req, res) => {
  try {
    const { id } = req.params;
    const { minted } = req.body;

    const voucher = await Voucher.findById(id);
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });

    voucher.minted = minted;
    await voucher.save();

    res.json({ success: true, minted: voucher.minted });
  } catch (err) {
    console.error("Update minted error:", err);
    res.status(500).json({ error: "Failed to update minted" });
  }
};
