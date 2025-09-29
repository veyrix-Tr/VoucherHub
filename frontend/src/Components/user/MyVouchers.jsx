import React, { useEffect, useState } from "react";
import { useWallet } from "../../Context/WalletContext.jsx";
import { fetchVouchersByOwner } from "../../utils/fetchVouchers.js";
import RedeemVoucher from "./RedeemVoucher.jsx";
import VoucherCard from "../common/VoucherCard.jsx";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function MyVouchers({ activeSection }) {
  const { account, isInitializing } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [redeemingVoucher, setRedeemingVoucher] = useState(null);

  useEffect(() => {
    loadVouchers();
  }, [account, isInitializing]);

  const loadVouchers = async () => {
    if (account) {
      await fetchVouchersByOwner(account, setVouchers, setLoading);
    } else if (!isInitializing) {
      toast.error("Please connect your wallet first");
    }
  };

  const now = Math.floor(Date.now() / 1000);

  const getFilteredVouchers = () => {
    switch (activeSection) {
      case "active":
        return vouchers.filter((v) => v.status !== "redeemed" && Number(v.expiry) > now);
      case "expired":
        return vouchers.filter((v) => v.status !== "redeemed" && Number(v.expiry) <= now);
      case "redeemed":
        return vouchers.filter((v) =>
          (v.redemptions || []).some(r =>
            r.redeemer?.toLowerCase() === account.toLowerCase()
          )
        );
      default:
        return vouchers;
    }
  };

  const filteredVouchers = getFilteredVouchers();

  const handleRedeemSuccess = () => {
    setRedeemingVoucher(null);
    loadVouchers();
    toast.success("Voucher redeemed successfully!");
  };

  const getSectionTitle = () => {
    const titles = {
      active: "Active Vouchers",
      expired: "Expired Vouchers",
      redeemed: "Redeemed Vouchers"
    };
    return titles[activeSection] || "My Vouchers";
  };

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{getSectionTitle()}</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {filteredVouchers.length} {filteredVouchers.length === 1 ? 'voucher' : 'vouchers'} found
            </p>
          </div>
          <button
            onClick={loadVouchers}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700 p-6">
                <div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-600 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3" />
              </div>
            ))}
          </div>

        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-3xl">🎫</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No {activeSection} vouchers found
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              {activeSection === "active"
                ? "Your active vouchers will appear here"
                : `You don't have any ${activeSection} vouchers yet`
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouchers.map(v => (
              <VoucherCard key={v._id} voucher={v} role="user" userBalance={v.balance || 0}
                onRedeem={activeSection === "active" ? setRedeemingVoucher : undefined} />
            ))}
          </div>
        )}
      </div>

      {redeemingVoucher && (
        <RedeemVoucher
          voucher={redeemingVoucher}
          onClose={() => setRedeemingVoucher(null)}
          onSuccess={handleRedeemSuccess}
        />
      )}
    </div>
  );
}