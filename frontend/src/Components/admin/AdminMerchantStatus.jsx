import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../Context/WalletContext.jsx";
import { toast } from "react-hot-toast";
import MerchantRegistryABI from "@contracts/exports/abi/MerchantRegistry.json";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";
import { fetchMerchantRequests } from "../../utils/utilsMerchantRequests.js";
import { ArrowPathIcon, CheckIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function AdminMerchantStatus() {
  const { signer, account } = useWallet();
  const [merchants, setMerchants] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});

  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";
  const MERCHANT_REGISTRY_ADDRESS = CONTRACT_ADDRESSES[CHAIN_ID]?.merchantRegistry;

  const contract = signer
    ? new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MerchantRegistryABI, signer)
    : null;

  const loadRequests = async () => {
    await fetchMerchantRequests("approved", setRequests, setLoading);
  };

  useEffect(() => {
    const enrichMerchants = async () => {
      if (!contract || requests.length === 0) return;

      const merchantData = await Promise.all(
        requests.map(async (request) => {
          try {
            const active = await contract.isMerchant(request.address);
            return { ...request, active };
          } catch {
            return { ...request, active: false };
          }
        })
      );
      setMerchants(merchantData);
    };

    enrichMerchants();
  }, [requests]);

  const toggleStatus = async (address, currentStatus, merchantName) => {
    try {
      if (!contract) return;
      
      setStatusLoading(prev => ({ ...prev, [address]: true }));
      const newStatus = !currentStatus;
      const tx = await contract.updateMerchantStatus(address, newStatus);

      toast.promise(
        tx.wait(),
        {
          loading: `${newStatus ? 'Activating' : 'Deactivating'} merchant...`,
          success: `${merchantName} ${newStatus ? "activated" : "deactivated"} successfully!`,
          error: "Transaction failed",
        }
      );

      await tx.wait();
      loadRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.reason || "Transaction failed");
    } finally {
      setStatusLoading(prev => ({ ...prev, [address]: false }));
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadRequests();
    }
  }, [account]);

  const activeCount = merchants.filter(m => m.active).length;
  const inactiveCount = merchants.filter(m => !m.active).length;

  return (
    <div className="bg-white dark:bg-slate-600/10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registered Merchants</h2>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Manage merchant activation status
              </p>
            </div>
          </div>
          <button onClick={loadRequests} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {merchants.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-200">Total: {merchants.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-600 dark:text-slate-300">Active: {activeCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-slate-600 dark:text-slate-300">Inactive: {inactiveCount}</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {merchants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <UserGroupIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No merchants found</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Approved merchants will appear here once they register
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {merchants.map((merchant, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    merchant.active 
                      ? "bg-green-100 dark:bg-green-900/30" 
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    {merchant.active ? (
                      <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-yellow-400 pb-2">{merchant.name || "Unnamed Merchant"}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                      {merchant.address.slice(0, 8)}...{merchant.address.slice(-6)}
                    </p>
                    {merchant.details && (
                      <p className="text-0.35xl text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {merchant.details}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    merchant.active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}>
                    {merchant.active ? "Active" : "Inactive"}
                  </span>
                  
                  <button
                    onClick={() => toggleStatus(merchant.address, merchant.active, merchant.name || "Merchant")}
                    disabled={statusLoading[merchant.address]}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-white ${
                      merchant.active
                        ? "bg-red-600 hover:bg-red-700 disabled:bg-slate-400"
                        : "bg-green-400 hover:bg-green-600 disabled:bg-slate-400 px-6"
                    }`}
                  >
                    {statusLoading[merchant.address] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : merchant.active ? (
                      <XMarkIcon className="w-4 h-4" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    {merchant.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}