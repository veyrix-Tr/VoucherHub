import React, { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import VoucherABI from "@contracts/exports/abi/VoucherERC1155.json";
import addresses from "@contracts/exports/addresses/addresses.js";
import axios from "axios";

export default function IssueVoucherModal({ voucher, signer, onClose, onSuccess }) {
  const [userAddress, setUserAddress] = useState("");
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  const CHAIN_ID = signer?.provider?._network?.chainId || parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);
  const contractAddress = addresses[CHAIN_ID]?.voucherERC1155;

  const remaining = (() => {
    try {
      const max = ethers.BigNumber.from(voucher.maxMint || "0");
      const minted = ethers.BigNumber.from(voucher.minted || "0");
      const left = max.sub(minted);
      return left.gt(ethers.constants.MaxUint256) ? Number.MAX_SAFE_INTEGER : left.toNumber();
    } catch {
      return Number(voucher.maxMint || 0);
    }
  })();

  const handleSubmit = async () => {
    if (!ethers.utils.isAddress(userAddress)) return toast.error("Invalid user address");
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > remaining) return toast.error(`Amount exceeds remaining supply (${remaining})`);
    if (!signer) return toast.error("Connect wallet first");
    if (!contractAddress) return toast.error("Contract address not configured");

    setLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, VoucherABI, signer);
      const bnAmount = ethers.BigNumber.from(String(amount));
      const voucherData = {
        voucherId: ethers.BigNumber.from(voucher.voucherId || "0"),
        merchant: voucher.merchant,
        maxMint: ethers.BigNumber.from(voucher.maxMint || "0"),
        expiry: ethers.BigNumber.from(voucher.expiry || "0"),
        metadataHash: voucher.metadataHash || "0x" + "0".repeat(64),
        metadataCID: voucher.metadataCID || voucher.metadata?.cid || "",
        price: ethers.BigNumber.from(voucher.price || "0"),
        nonce: ethers.BigNumber.from(voucher.nonce || "0")
      };

      let tx;
      try {
        if (typeof contract.issueVoucherToUser === "function") {
          tx = await contract.issueVoucherToUser(voucherData, bnAmount, userAddress);
        } else {
          if (!voucher.signature) throw new Error("Fallback mint requires signature");
          tx = await contract.mintFromVoucher(voucherData, voucher.signature, bnAmount, userAddress);
        }
        toast.loading("Sending transaction...");
        const receipt = await tx.wait();
        toast.dismiss();
        toast.success("Voucher issued — tx confirmed");
        try {
          const newMinted = (Number(voucher.minted || "0") + amount);
          await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers/${voucher._id}/minted`, {
            minted: newMinted
          });
        } catch (err) {
          console.error("Failed to update minted in backend:", err);
        }

        onSuccess && onSuccess();
        onClose && onClose();
        return receipt;
      } catch (err) {
        throw err;
      }
    } catch (err) {
      console.error("IssueVoucher error:", err);
      const msg = err?.error?.message || err?.message || "Transaction failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Issue Voucher</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Close</button>
        </div>

        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="break-words overflow-x-auto">
            <strong>Voucher ID:</strong> {String(voucher.voucherId)}
          </div>
          <div className="truncate">
            <strong>Title:</strong> {voucher.metadata?.name || voucher.metadataCID || "-"}
          </div>
          <div className="text-xs text-slate-500">
            Remaining: <strong>{remaining}</strong>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="User wallet address (0x...)"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
          />
          <input
            type="number"
            min={1}
            max={remaining}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {loading ? "Issuing..." : "Issue to user"}
          </button>
        </div>
      </div>
    </div>
  );
}
