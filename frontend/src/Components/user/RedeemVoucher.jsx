import React, { useState } from "react";
import axios from "axios";
import { useWallet } from "../../Context/WalletContext.jsx";
import { ethers } from "ethers";
import VoucherERC1155ABI from "../../abi/VoucherERC1155.json";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;

export default function RedeemVoucher() {
  const { account, signer } = useWallet();
  const [voucherId, setVoucherId] = useState("");
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const contractAddress = CONTRACT_ADDRESSES[CHAIN_ID].voucherERC1155;

  async function handleRedeem() {
    if (!voucherId) return alert("Enter Voucher ID");
    if (!account || !signer) return alert("Connect wallet first");

    setLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, VoucherERC1155ABI, signer);

      const tx = await contract.burnForRedeem(voucherId, amount);
      const receipt = await tx.wait();

      await axios.put(`${backendUrl}/api/vouchers/${voucherId}/redeem`, {
        redeemer: account,
        txHash: receipt.transactionHash,
      });
      alert(`Voucher redeemed! Tx: ${receipt.transactionHash}`);
      setVoucherId("");

    } catch (err) {
      console.error("Redeem error:", err);
      alert(err?.reason || err?.response?.data?.error || "Redeem failed");

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">Redeem Voucher</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Voucher ID"
          value={voucherId}
          onChange={(e) => setVoucherId(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 border rounded px-3 py-2"
        />
        <button
          onClick={handleRedeem}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Redeeming..." : "Redeem"}
        </button>
      </div>
    </div>
  );
}
