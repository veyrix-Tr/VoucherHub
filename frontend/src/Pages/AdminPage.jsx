import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useWallet } from "../Context/WalletContext.jsx";
import VoucherABI from "../../../backend/src/abi/VoucherERC1155.json";
import addresses from "../contracts/addresses.js";
import { createGatewayUrl } from "../utils/ipfs.js";
import { fetchVouchersByStatus } from "../utils/fetchVoutchers.js";

export default function AdminPage() {
  const { provider, signer, account } = useWallet();

  // usestate for {vouchers}, {is the list of vouchers, loading}
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  // it stores the loading stautus of a voucher, if any voucher is approving or rejecting, it prevent reclick and 
  const [statusLoading, setStatusLoading] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const CHAIN_ID = provider ? provider._network?.chainId : parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);
  const voucherContractAddress = addresses[CHAIN_ID]?.voucherERC1155 || import.meta.env.VITE_VOUCHER_CONTRACT_ADDRESS;

  // every time account or chainId changes grab pending vouchers
  useEffect(() => {
    fetchVouchersByStatus("pending", setVouchers, setLoading);
  }, [account, CHAIN_ID]);

  // get request to backend and filtered by status voucher returned by backend and set to vouchers

  async function fetchMetadata(v) {
    try {
      const url = await createGatewayUrl(v.metadataCID);
      const resp = await fetch(url);
      const metadata = await resp.json();
      const image = metadata.image
        ? await createGatewayUrl(metadata.image)
        : null;
      return ({ metadata, image });
    } catch (err) {
      console.error("Failed to fetch metadata for", v.voucherId, err);
    }
  }

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

      let voucherIdForContract = ethers.BigNumber.from(v.voucherId);
      const contract = new ethers.Contract(voucherContractAddress, VoucherABI, signer);

      const tx = await contract.setVoucherApproval(voucherIdForContract, true);
      console.log(tx.hash);
      await tx.wait();

      await axios.put(`${backendUrl}/api/vouchers/${id}/approve`, { txHash: tx.hash });
      await fetchVouchersByStatus("pending", setVouchers, setLoading);
      alert("Voucher approved and backend updated");

    } catch (err) {
      console.error("Approve error", err);
      alert(err?.response?.data?.error || err.message || "Approval failed");

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
      alert(err?.response?.data?.error || err.message || "Reject failed");
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
          onClick={()=>fetchVouchersByStatus("pending", setVouchers, setLoading)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {vouchers.length === 0 && !loading ? (
        <div className="text-gray-500 text-center py-10">No pending vouchers</div>
      ) : (
        <div className="grid gap-6">
          {vouchers.map(v => {
            const id = v._id || v.id;
            return (
              <div
                key={id}
                className="flex flex-col md:flex-row items-center md:items-start p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="w-full md:w-40 flex-shrink-0 mb-4 md:mb-0">
                  {v.imageUrl ? (
                    <img
                      src={v.imageUrl}
                      alt="voucher"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 md:ml-6">
                  <div className="mb-2 text-gray-700">
                    <span className="font-semibold">VoucherId:</span> {String(v.voucherId)}
                  </div>
                  <div className="mb-2 text-gray-700">
                    <span className="font-semibold">Merchant:</span> {v.merchant}
                  </div>
                  <div className="mb-2 text-gray-700">
                    <span className="font-semibold">MaxMint:</span> {String(v.maxMint)}
                  </div>
                  <div className="mb-2 text-gray-700">
                    <span className="font-semibold">Expiry:</span>{" "}
                    {new Date(Number(v.expiry) * 1000).toLocaleString()}
                  </div>
                  <div className="mb-4 text-gray-700">
                    <span className="font-semibold">Price:</span> {String(v.price)}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(v)}
                      disabled={!!statusLoading[id]}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                    >
                      {statusLoading[id] ? "Approving..." : "Approve (on-chain)"}
                    </button>
                    <button
                      onClick={() => {
                        // 🔹 open modal for this voucher
                        setRejectTarget(v);
                        setRejectText("");
                        setShowRejectModal(true);
                      }}
                      disabled={!!statusLoading[id]}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                    >
                      {statusLoading[id] ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔹 single modal rendered outside map */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-3">Reject Voucher</h2>
            <p className="text-sm mb-2">
              Rejecting voucher:{" "}
              <strong>{rejectTarget && String(rejectTarget.voucherId)}</strong>
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
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}