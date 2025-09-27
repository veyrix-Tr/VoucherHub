import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import VoucherCard from "../common/VoucherCard.jsx";

export default function MyVouchers({ loading, activeTab, setActiveTab, loadVouchers, statusConfig, grouped }) {
  const current = grouped[activeTab] || [];

  return (
    <div className="bg-white/90 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Vouchers</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Manage your voucher collection and track their status</p>
        </div>
        <button
          onClick={loadVouchers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="px-6 pt-6 flex gap-2 overflow-x-auto">
        {Object.entries(statusConfig).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium cursor-pointer ${
              activeTab === key
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <span>{icon}</span>
            <span className="flex-1">{label}</span>
            <span className="font-semibold">{(grouped[key] || []).length}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700 p-6">
                <div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-600 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : current.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl">
              {statusConfig[activeTab].icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No {activeTab} vouchers</h3>
            <p className="text-slate-600 dark:text-slate-300">
              {activeTab === "approved"
                ? "Your approved vouchers will appear here"
                : activeTab === "pending"
                ? "Vouchers waiting for admin approval"
                : activeTab === "rejected"
                ? "Vouchers that were not approved"
                : "Vouchers redeemed by customers"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {current.map(v => (
              <VoucherCard key={v._id} voucher={v} role="merchant" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
