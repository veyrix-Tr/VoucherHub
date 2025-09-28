import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useWallet } from "../Context/WalletContext.jsx";
import VoucherABI from "@contracts/exports/abi/VoucherERC1155.json";
import addresses from "@contracts/exports/addresses/addresses.js";
import { fetchVouchersByStatus } from "../utils/fetchVouchers.js";
import VoucherCard from "../Components/common/VoucherCard.jsx";
import AdminMerchantRequests from "../Components/admin/AdminMerchantRequests.jsx";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import AdminMerchantStatus from "../Components/admin/AdminMerchantStatus.jsx";

export default function AdminPage() {
  const { signer, account, provider } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [activeTab, setActiveTab] = useState("vouchers");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectText, setRejectText] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const CHAIN_ID = provider?._network?.chainId || parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);
  const voucherContractAddress = addresses[CHAIN_ID]?.voucherERC1155;

  useEffect(() => {
    if (activeTab === "vouchers") {
      loadPendingVouchers();
    }
  }, [account, CHAIN_ID, activeTab]);

  const loadPendingVouchers = async () => {
    try {
      setLoading(true);
      await fetchVouchersByStatus("pending", setVouchers, setLoading);
    } catch (error) {
      console.error("Failed to load vouchers:", error);
      toast.error("Failed to load pending vouchers");
    }
  };

  async function handleApprove(v) {
    if (!account) {
      return toast.error("Please connect your wallet first");
    }
    
    if (!voucherContractAddress) {
      return toast.error("Voucher contract address not found");
    }

    const id = v._id;
    try {
      setStatusLoading(prev => ({ ...prev, [id]: true }));

      const contract = new ethers.Contract(voucherContractAddress, VoucherABI, signer);
      let voucherIdForContract = ethers.BigNumber.from(v.voucherId);
      
      const tx = await contract.setVoucherApproval(voucherIdForContract, true);
      toast.promise(
        tx.wait(),
        {
          loading: 'Approving voucher on blockchain...',
          success: 'Voucher approved on blockchain!',
          error: 'Blockchain approval failed'
        }
      );
      await tx.wait();
      await axios.put(`${backendUrl}/api/vouchers/${id}/approve`, { txHash: tx.hash });
      await loadPendingVouchers();
      toast.success("Voucher approved successfully!");

    } catch (err) {
      console.error("Approve error", err);
      toast.error(err.reason || "Approval failed");
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  async function handleRejectSubmit() {
    if (!rejectTarget) return
    else if (!account) return toast.error("Connect wallet as admin");

    const id = rejectTarget._id;
    const notes = rejectText || "No reason provided";
    try {
      setStatusLoading(prev => ({ ...prev, [id]: true }));
      await axios.put(`${backendUrl}/api/vouchers/${id}/reject`, { notes });
      await loadPendingVouchers();
      toast.success("Voucher rejected successfully!");
    } catch (err) {
      console.error("Reject error", err);
      toast.error(err.response?.data?.error || "Rejection failed");
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectText("");
    }
  }

  const tabs = [
    { key: "vouchers", label: "Pending Vouchers", count: vouchers.length, icon: "📋" },
    { key: "merchants", label: "Merchant Requests", icon: "👨‍💼" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <div className="max-w-9xl mx-auto px-6 sm:px-16 lg:px-13 py-9">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 100 via-pink-400 to-pink-800 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
            Manage platform content and merchant applications
          </p>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-6 py-4 text-md font-medium border-b-2 transition-all cursor-pointer ${activeTab === tab.key
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.key ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "vouchers" ? (
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Vouchers</h2>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Review and approve vouchers submitted by merchants
                  </p>
                </div>
                <button onClick={loadPendingVouchers} disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-600/70 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700 p-6">
                      <div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-600 mb-4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : vouchers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No pending vouchers</h3>
                  <p className="text-slate-600 dark:text-slate-300">All vouchers have been reviewed</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vouchers.map((v) => (
                    <VoucherCard key={v._id} voucher={v} role="admin"
                      onApprove={() => handleApprove(v)}
                      onReject={() => { setRejectTarget(v); setShowRejectModal(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <AdminMerchantRequests />
        )}

        <div className="mt-16">
          <div className="p-6">
            <AdminMerchantStatus />
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <XMarkIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reject Voucher</h3>
                  <p className="text-slate-600 dark:text-slate-300">Provide a reason for rejection</p>
                </div>
              </div>

              <button onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" >
                <XMarkIcon className="w-6 h-6 text-blue-500 dark:text-blue-400 cursor-pointer" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {rejectTarget?.metadata?.name || "Unnamed Voucher"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 break-words whitespace-normal">
                  Voucher ID: {rejectTarget?.voucherId}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reason for Rejection (Optional)
                </label>
                <textarea rows={4} value={rejectText}
                  placeholder="Explain why this voucher is being rejected..."
                  onChange={(e) => setRejectText(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={statusLoading[rejectTarget?._id]}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 transition-all font-medium shadow-sm"
              >
                {statusLoading[rejectTarget?._id] ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </span>
                ) : (
                  "Reject Voucher"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}