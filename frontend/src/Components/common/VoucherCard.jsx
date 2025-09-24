import React, { useState } from "react";
import VoucherModal from "./VoucherModal.jsx";
import { EyeIcon, CheckIcon, XMarkIcon, GiftIcon, ArrowsRightLeftIcon, ClockIcon,} from "@heroicons/react/24/outline";

export default function VoucherCard({
  voucher, role, userBalance,
  onApprove, onReject, onRedeem, onSwap,
}) {
  const [showModal, setShowModal] = useState(false);

  const getExpiryDate = () => {
    if (voucher.expiry) {
      return new Date(Number(voucher.expiry) * 1000);
    } else if (voucher.metadata?.expiry) {
      return new Date(voucher.metadata.expiry);
    }
    return null;
  };

  const expiryDate = getExpiryDate();
  const isExpired = expiryDate && expiryDate < new Date();
  const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const getStatusBadge = () => {
    if (isExpired) {
      return { label: "Expired", color: "bg-red-100 text-red-800 border-red-200" };
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
      return { label: "Expiring Soon", color: "bg-orange-100 text-orange-800 border-orange-200" };
    } else if (voucher.status === "approved") {
      return { label: "Verified", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    } else if (voucher.status === "pending") {
      return { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    }
    return { label: "Active", color: "bg-blue-100 text-blue-800 border-blue-200" };
  };
  const status = getStatusBadge();

  const formatPrice = (price) => {
    if (!price) return "Free";
    else if (price == 0) return "Free";
    return `${Number(price).toFixed(3)} ETH`;
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
          {voucher.imageUrl ? (
            <img src={voucher.imageUrl} alt={voucher.metadata?.name || "Voucher"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <GiftIcon className="w-8 h-8" />
              <span className="text-sm mt-2">No Image</span>
            </div>
          )}
          {/* show very light black like effect on hover the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight">
              {voucher.metadata?.name || "Unnamed Voucher"}
            </h3>

            {voucher.price && (
              <div className="flex-shrink-0 ml-3">
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold shadow-sm">
                  {formatPrice(voucher.price)}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {voucher.metadata?.description || "No description available"}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <ClockIcon className="w-3 h-3" />
              <span className="ml-1">
                {expiryDate ? expiryDate.toLocaleDateString() : "No expiry"}
              </span>
            </div>
            {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
              <div className="text-right text-slate-500 dark:text-slate-400">
                {daysUntilExpiry === 1 ? "1 day left" : `${daysUntilExpiry} days left`}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 hover:shadow-md flex-1 justify-center"
          >
            <EyeIcon className="w-4 h-4" />
            Details
          </button>

          <div className="flex gap-2 w-full">
            {onApprove && (
              <button onClick={() => onApprove(voucher)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-all duration-200 hover:shadow-md flex-1 justify-center"
              >
                <CheckIcon className="w-4 h-4" />
                Approve
              </button>
            )}
            {onReject && (
              <button onClick={() => onReject(voucher)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 hover:shadow-md flex-1 justify-center"
              >
                <XMarkIcon className="w-4 h-4" />
                Reject
              </button>
            )}
            {onRedeem && !isExpired && (
              <button onClick={() => onRedeem(voucher)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 hover:shadow-md flex-1 justify-center"
              >
                <GiftIcon className="w-4 h-4" />
                Redeem
              </button>
            )}
            {onSwap && (
              <button onClick={() => onSwap(voucher)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:shadow-md flex-1 justify-center"
              >
                <ArrowsRightLeftIcon className="w-4 h-4" />
                Swap
              </button>
            )}
          </div>
        </div>

        {isExpired && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg bg-black/50 px-4 py-2 rounded-lg">
              Expired
            </span>
          </div>
        )}
      </div>

      {showModal && (
        <VoucherModal voucher={voucher} role={role} userBalance={userBalance} onClose={() => setShowModal(false)} expiryDate={expiryDate} isExpired={isExpired} daysUntilExpiry={daysUntilExpiry} getStatusBadge={getStatusBadge} status={status} />
      )}
    </>
  );
}