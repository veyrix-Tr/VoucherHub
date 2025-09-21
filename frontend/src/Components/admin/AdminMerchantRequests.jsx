import React, { useEffect, useState } from "react";
import { useWallet } from "../../Context/WalletContext.jsx";
import { fetchMerchantRequests, approveMerchantRequest, rejectMerchantRequest } from "../../utils/utilsMerchantRequests.js";
import MerchantRegistryABI from "../../../../backend/src/abi/MerchantRegistry.json";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";

export default function AdminMerchantRequests() {
  const { signer } = useWallet();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";
  const registryAddress = CONTRACT_ADDRESSES[CHAIN_ID]?.merchantRegistry;

  useEffect(() => {
    fetchMerchantRequests("pending", setRequests, setLoading);
  }, []);

  async function handleApprove(req) {
    if (!signer) return alert("Connect admin wallet");
    if (!registryAddress) return alert("Registry not configured");

    const ok = await approveMerchantRequest(req, signer, MerchantRegistryABI, registryAddress);
    if (ok) {
      alert("Merchant approved!");
      fetchMerchantRequests("pending", setRequests, setLoading);
    } else {
      return alert("Merchant approval failed!");
    }
  }

  async function handleReject(reqId) {
    const notes = prompt("Reason for rejection?");
    const ok = await rejectMerchantRequest(reqId, notes);
    if (ok) {
      alert("Merchant rejected!");
      fetchMerchantRequests("pending", setRequests, setLoading);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Merchant Requests</h1>
      {loading && <p>Loading...</p>}
      {!loading && requests.length === 0 && <p>No pending requests.</p>}

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req._id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{req.name}</p>
              <p className="text-sm text-gray-600">{req.details}</p>
              <p className="text-xs text-gray-400">Wallet: {req.address}</p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={loading}
                onClick={() => handleApprove(req)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                disabled={loading}
                onClick={() => handleReject(req._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
