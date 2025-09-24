import React from "react";
import { XMarkIcon, DocumentTextIcon, UserIcon, CurrencyDollarIcon, CubeIcon, CalendarIcon, CheckBadgeIcon, ClockIcon, LinkIcon, GiftIcon, } from "@heroicons/react/24/outline";

export default function VoucherModal({ voucher, role, userBalance, onClose, expiryDate, isExpired, daysUntilExpiry, status }) {
  if (!voucher) return null;

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
        <div className="text-sm text-gray-900 break-words whitespace-normal">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <GiftIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {voucher.metadata?.name || "Voucher Details"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                  {status.label}
                </span>
                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                  <div className="pl-3 flex flex-row space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-500">
                      {daysUntilExpiry}d left
                    </span>
                  </div>
                )}
                {isExpired && (
                  <span className="text-xs text-red-500 font-medium">
                    Expired
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {voucher.imageUrl && (
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <img src={voucher.imageUrl} alt={voucher.metadata?.name || "Voucher"} className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="overflow-y-auto max-h-96">
          <div className="p-6">
            {voucher.metadata?.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {voucher.metadata.description}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Voucher Information</h3>
                <div className="space-y-0">
                  <InfoItem icon={CubeIcon} label="Voucher ID" value={voucher.voucherId || "Not available"} />
                  <InfoItem icon={UserIcon} label="Merchant" value={voucher.merchant || voucher.merchantName || "Unknown"} />
                  <InfoItem icon={CurrencyDollarIcon} label="Price" value={voucher.price ? `$${voucher.price}` : "Free"}/>

                  {role === "user" && userBalance !== undefined ? (
                    <InfoItem icon={CheckBadgeIcon} label="Your Balance" value={`${userBalance} unit${userBalance !== 1 ? 's' : ''}`}/>
                  ) : (
                    <InfoItem icon={CubeIcon} label="Max Mint" value={voucher.maxMint || "Unlimited"} />
                  )}

                  <InfoItem icon={CalendarIcon} label="Expiry Date" value={expiryDate ? expiryDate.toLocaleDateString() : "No expiry"} />
                </div>
              </div>

              {voucher.metadataCID && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Blockchain Data</h3>
                  <InfoItem icon={DocumentTextIcon} label="IPFS Metadata" value={`${voucher.metadataCID.slice(0, 12)}.....${voucher.metadataCID.slice(-8)}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Close
          </button>
          {role === "user" && userBalance > 0 && (
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" disabled={isExpired}>
              Redeem Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}