import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../Context/WalletContext.jsx";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";
import VoucherERC1155ABI from "../../../../backend/src/abi/VoucherERC1155.json";
import axios from "axios";
import { XMarkIcon, GiftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function RedeemVoucher({ voucher, onClose, onSuccess }) {
  const { account, signer } = useWallet();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";

  if (!voucher) return null;

  const availableBalance = Number(voucher.balance || 0);

  const handleRedeem = async () => {
    if (!signer || !account) {
      toast.error("Please connect your wallet first");
      return;
    } else if (amount > availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }

    setLoading(true);
    try {
      const voucherContractAddress = CONTRACT_ADDRESSES[CHAIN_ID]?.voucherERC1155;
      const voucherContract = new ethers.Contract(voucherContractAddress, VoucherERC1155ABI, signer);

      const tx = await voucherContract.burnForRedeem(
        ethers.BigNumber.from(voucher.voucherId),
        ethers.BigNumber.from(amount)
      );

      // Show toast notifications tied to the transaction lifecycle (pending → success/error)
      toast.promise(
        tx.wait(),
        {
          loading: 'Processing transaction...',
          success: 'Transaction confirmed!',
          error: 'Transaction failed'
        }
      );

      const receipt = await tx.wait();

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers/${voucher._id}/redeem`, {
        redeemer: account,
        txHash: receipt.transactionHash,
        amount: amount
      });

      onSuccess();
    } catch (err) {
      console.error("Redeem error:", err);
      toast.error(err.reason || "Failed to redeem voucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">

        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <GiftIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Redeem Voucher</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Burn tokens to redeem your voucher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" disabled={loading} >
            <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
              {voucher.metadata?.name || "Unnamed Voucher"}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {voucher.metadata?.description || "No description available"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Amount to Redeem
            </label>
            <div className="flex items-center gap-3">
              <input type="number" min="1" max={availableBalance} value={amount} disabled={loading}
                onChange={(e) => setAmount(Math.max(1, Math.min(availableBalance, parseInt(e.target.value) || 1)))}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Max: {availableBalance}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">Available Balance</span>
            <span className="font-medium text-slate-900 dark:text-white">{availableBalance} tokens</span>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleRedeem}
            disabled={loading || amount > availableBalance || amount < 1}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-slate-400 disabled:to-slate-400 transition-all font-medium shadow-sm"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Redeem Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}