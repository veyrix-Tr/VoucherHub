import React, { useEffect, useState, useMemo } from "react";
import { useWallet } from "../Context/WalletContext.jsx";
import addresses from "@contracts/exports/addresses/addresses.js";
import merchantRegistryAbi from '@contracts/exports/abi/MerchantRegistry.json' with { type: "json" };
import MerchantVoucherForm from "../Components/merchant/MerchantVoucherForm.jsx";
import { fetchVouchersByMerchant } from "../utils/fetchVouchers.js";
import { PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import MyVouchers from "../Components/merchant/MyVouchers.jsx";
import { ethers } from "ethers";

export default function MerchantPage() {
  const { account, signer, provider, isInitializing } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("approved");
  const [isActive, setIsActive] = useState(false);

  const chainId = provider?._network?.chainId || parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);

  useEffect(() => {
    loadVouchers();
  }, [account, isInitializing]);

  useEffect(() => {
    const fetchActive = async () => {
      if (account) {
        const active = await checkActive(account);
        setIsActive(active);
      }
    };
    fetchActive();
  }, [account, provider, chainId]);

  const checkActive = async (account) => {
    const registry = new ethers.Contract(
      addresses[chainId]?.merchantRegistry,
      merchantRegistryAbi,
      provider
    );
    return await registry.isMerchant(account);
  }

  const loadVouchers = async () => {
    if (account) {
      await fetchVouchersByMerchant(account, setVouchers, setLoading);
    } else if(!isInitializing) {
      toast.error("Please connect your wallet first");
    }
  };
  const statusConfig = {
    approved: { label: "Approved", color: "green", icon: "✅" },
    pending: { label: "Pending", color: "yellow", icon: "⏳" },
    rejected: { label: "Rejected", color: "red", icon: "❌" },
    redeemed: { label: "Redeemed", color: "blue", icon: "🎫" },
  };
  const colorClasses = {
    green: {
      bg: "bg-green-50 dark:bg-green-900/30",
      label: "text-green-700 dark:text-green-300",
      value: "text-green-600 dark:text-green-400",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      label: "text-yellow-700 dark:text-yellow-300",
      value: "text-yellow-600 dark:text-yellow-400",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/30",
      label: "text-red-700 dark:text-red-300",
      value: "text-red-600 dark:text-red-400",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      label: "text-blue-700 dark:text-blue-300",
      value: "text-blue-600 dark:text-blue-400",
    },
  };

  const grouped = useMemo(() => {
    return vouchers.reduce((acc, v) => {
      acc[v.status] = [...(acc[v.status] || []), v];
      return acc;
    }, {});
  }, [vouchers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <div className="max-w-9xl mx-auto px-6 sm:px-16 lg:px-13 py-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 100 via-pink-400 to-pink-800 bg-clip-text text-transparent">
            Merchant Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
            Create and manage your vouchers
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-14">
            <div className="bg-white/90 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <PlusIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Voucher</h2>
                  <p className="text-slate-600 dark:text-slate-300">Issue a new voucher for your customers</p>
                </div>
              </div>
              <div className="p-6">
                <MerchantVoucherForm signer={signer} contractAddress={addresses[chainId]?.voucherERC1155} isActive={isActive} />
              </div>
            </div>

            <MyVouchers
              loading={loading} activeTab={activeTab} setActiveTab={setActiveTab} loadVouchers={loadVouchers} statusConfig={statusConfig} grouped={grouped} signer={signer}
            />
          </div>

          <aside className="lg:col-span-1 pl-10">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 space-y-4 bg-white/90 dark:bg-slate-900/80">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Voucher Stats</h3>
                {Object.entries(statusConfig).map(([key, { label, color }]) => (
                  <div key={key} className={`flex justify-between items-center p-3 ${colorClasses[color].bg} rounded-lg`}>
                    <span className={`font-medium ${colorClasses[color].label}`}>{label}</span>
                    <span className={`text-lg font-bold ${colorClasses[color].value}`}>{(grouped[key] || []).length}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Total</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{vouchers.length}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
