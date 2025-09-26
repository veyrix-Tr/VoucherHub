import React, { useEffect, useState } from "react";
import { useWallet } from "../../Context/WalletContext.jsx";
import { fetchMerchantRequests, approveMerchantRequest, rejectMerchantRequest } from "../../utils/utilsMerchantRequests.js";
import MerchantRegistryABI from "../../../../backend/src/abi/MerchantRegistry.json";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";
import { CheckIcon, XMarkIcon, UserIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function AdminMerchantRequests() {
  const { signer, account } = useWallet();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});

  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";
  const registryAddress = CONTRACT_ADDRESSES[CHAIN_ID]?.merchantRegistry;

  useEffect(() => {
    loadRequests();
  }, []);

  console.log(requests);

  const loadRequests = async () => {
    await fetchMerchantRequests("pending", setRequests, setLoading);
  };

  async function handleApprove(req) {
    if (!signer) {
      toast.error("Connect admin wallet");
      return;
    }
    if (!registryAddress) {
      toast.error("Registry not configured");
      return;
    }

    try {
      setStatusLoading(prev => ({ ...prev, [req._id]: true }));
      const ok = await approveMerchantRequest(req, signer, MerchantRegistryABI, registryAddress);

      if (ok) {
        toast.success("Merchant approved successfully!");
        loadRequests();
      } else {
        toast.error("Merchant approval failed!");
      }
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(err.reason || "Approval failed");
    } finally {
      setStatusLoading(prev => ({ ...prev, [req._id]: false }));
    }
  }

  async function handleReject(req) {
    const notes = prompt("Reason for rejection?") || "No reason provided";

    try {
      setStatusLoading(prev => ({ ...prev, [req._id]: true }));
      const ok = await rejectMerchantRequest(req._id, notes);

      if (ok) {
        toast.success("Merchant request rejected!");
        loadRequests();
      } else {
        toast.error("Rejection failed!");
      }
    } catch (err) {
      console.error("Rejection error:", err);
      toast.error("Rejection failed");
    } finally {
      setStatusLoading(prev => ({ ...prev, [req._id]: false }));
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Requests</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Review and approve merchant applications
            </p>
          </div>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-700 rounded-lg p-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3 mb-3" />
                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No pending requests</h3>
            <p className="text-slate-600 dark:text-slate-300">All merchant applications have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{req.name}</h3>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 mb-3">{req.details}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-mono bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                        {req.address}
                      </span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={statusLoading[req._id]}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-slate-400 transition-colors font-medium"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req)}
                      disabled={statusLoading[req._id]}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-slate-400 transition-colors font-medium"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}