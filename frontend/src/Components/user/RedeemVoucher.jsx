import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../Context/WalletContext.jsx";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";
import VoucherERC1155ABI from "../../../../backend/src/abi/VoucherERC1155.json";
import axios from "axios";

export default function RedeemVoucher({ voucher, onClose, onSuccess }) {
  const { account, signer } = useWallet();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";

  if (voucher) {
    const maxAvailable = voucher.maxMint - (voucher.redemptions?.reduce((sum, r) => sum + r.amount, 0) || 0);

    const handleRedeem = async () => {
      if (!signer || !account) {
        return alert("Please connect your wallet");
      }

      setLoading(true);
      try {
        const voucherContractAddress = CONTRACT_ADDRESSES[CHAIN_ID]?.voucherERC1155;
        const voucherContract = new ethers.Contract(voucherContractAddress, VoucherERC1155ABI, signer);

        const tx = await voucherContract.burnForRedeem(
          ethers.BigNumber.from(voucher.voucherId),
          ethers.BigNumber.from(amount)
        );

        const receipt = await tx.wait();

        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/vouchers/${voucher._id}/redeem`, {
          redeemer: account,
          txHash: receipt.transactionHash,
          amount: amount
        }
        );

        onSuccess();
      } catch (err) {
        console.error("Redeem error:", err);
      } finally {
        setLoading(false);
      }
    };


    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-5 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Redeem Voucher</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              &times;
            </button>
          </div>

          <div className="mb-4">
            <div className="font-semibold">{voucher.metadata?.name}</div>
            <div className="text-sm text-gray-600">{voucher.metadata?.description}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to redeem (Max: {maxAvailable})
            </label>
            <input
              type="number"
              min="1"
              max={maxAvailable}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              className="w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-green-400"
              disabled={loading || amount > maxAvailable}
            >
              {loading ? "Processing..." : "Redeem"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}