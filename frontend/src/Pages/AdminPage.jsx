import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useWallet } from "../Context/WalletContext.jsx";
import VoucherABI from "../../../backend/src/abi/VoucherERC1155.json";
import addresses from "../contracts/addresses.js";
import { fetchVouchersByStatus } from "../utils/fetchVouchers.js";
import VoucherCard from "../Components/common/VoucherCard.jsx";


export default function AdminPage() {
  const { provider, signer, account } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  // it stores the loading stautus of a voucher, if any voucher is approving or rejecting, it prevent reclick and 
  const [statusLoading, setStatusLoading] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const CHAIN_ID = provider?._network?.chainId || parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);
  
  const voucherContractAddress = addresses[CHAIN_ID]?.voucherERC1155 || import.meta.env.VITE_VOUCHER_CONTRACT_ADDRESS;

  // every time account or chainId changes grab pending voucherstatusLoadings
  useEffect(() => {
    fetchVouchersByStatus("pending", setVouchers, setLoading);
  }, [account, CHAIN_ID]);

  // get request to backend and filtered by status voucher returned by backend and set to vouchers

  /**
   * take voucher as input and store it's _id(mongoose) 
   * for the voucher set status to loading
   * get contract with abi, address and provider 
   * and change the satus means approve or reject and store in tx
   * console.log tx-hash and wait to txn to complete, because it can fail
   * send update request to backend and refresh the vouchers
  */
  async function handleApprove(v) {
    if (!signer) return alert("Connect wallet as admin");
    if (!voucherContractAddress) return alert("Voucher contract address not configured");
    const id = v._id;
    try {
      setStatusLoading(prev => ({ ...prev, [id]: true }));

      const contract = new ethers.Contract(voucherContractAddress, VoucherABI, signer);
      let voucherIdForContract = ethers.BigNumber.from(v.voucherId);

      const tx = await contract.setVoucherApproval(voucherIdForContract, true);
      console.log(tx.hash);
      await tx.wait();

      await axios.put(`${backendUrl}/api/vouchers/${id}/approve`, { txHash: tx.hash });
      await fetchVouchersByStatus("pending", setVouchers, setLoading);
      alert("Voucher approved and backend updated");

    } catch (err) {
      console.error("Approve error", err);
      alert(err.message || "Approval failed");

    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectText, setRejectText] = useState("");

  async function handleRejectSubmit() {
    if (!rejectTarget) return;
    const id = rejectTarget._id || rejectTarget.id;
    const notes = rejectText || "";
    try {
      setStatusLoading(prev => ({ ...prev, [id]: true }));
      await axios.put(`${backendUrl}/api/vouchers/${id}/reject`, { notes });
      await fetchVouchersByStatus("pending", setVouchers, setLoading);
      alert("Voucher rejected");

    } catch (err) {
      console.error("Reject error", err);
      alert(err.message || "Reject failed");

    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectText("");
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin — Pending Vouchers</h2>

      <div className="mb-6">
        <button
          onClick={() => fetchVouchersByStatus("pending", setVouchers, setLoading)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {vouchers.length === 0 && !loading ? (
        <div className="text-gray-500 text-center py-10">No pending vouchers</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((v) => (
            <VoucherCard key={v._id} voucher={v} role="admin"
              onApprove={(v) => {
                if (!statusLoading[v._id]) handleApprove(v);
              }} onReject={(v) => {
                if (!statusLoading[v._id]) {
                  setRejectTarget(v);
                  setRejectText("");
                  setShowRejectModal(true);
                }
              }
              } />
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-3">Reject Voucher</h2>
            <p className="text-sm mb-2">
              Rejecting voucher: <strong>{rejectTarget?.voucherId}</strong>
            </p>
            <textarea
              rows={4}
              placeholder="Enter reason (optional)..."
              value={rejectText}
              onChange={(e) => setRejectText(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectTarget(null);
                  setRejectText("");
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button disabled={rejectTarget && statusLoading[rejectTarget._id]} 
              onClick={handleRejectSubmit} 
              className="px-4 py-2 bg-red-600 text-white rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
