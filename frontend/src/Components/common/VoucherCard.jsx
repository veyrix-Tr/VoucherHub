import React, { useState } from "react";
import VoucherModal from "./VoucherModal.jsx";

export default function VoucherCard({
  voucher,
  role,
  onApprove,
  onReject,
  onRedeem,
  onSwap,
}) {
  const [showModal, setShowModal] = useState(false);

  const expiryDate = voucher.expiry
    ? new Date(Number(voucher.expiry) * 1000).toLocaleDateString()
    : voucher.metadata?.expiry
    ? new Date(voucher.metadata.expiry).toLocaleDateString()
    : "N/A";

  return (
    <>
      <div className="border rounded-lg shadow hover:shadow-lg transition flex flex-col bg-white">
        {voucher.imageUrl ? (
          <img
            src={voucher.imageUrl}
            alt={voucher.metadata?.name || "Voucher"}
            className="w-full h-48 object-cover rounded-t"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
          <h3 className="font-bold text-lg">{voucher.metadata?.name || "Unnamed Voucher"}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{voucher.metadata?.description}</p>
          <p className="text-sm text-gray-700"><span className="font-semibold">Expiry:</span> {expiryDate}</p>
          {voucher.price && (
            <p className="text-sm text-gray-700"><span className="font-semibold">Price:</span> {voucher.price}</p>
          )}
        </div>

        <div className="p-3 flex flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            View
          </button>

          {onApprove && (
            <button
              onClick={() => onApprove(voucher)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
            >
              Approve
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(voucher)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
            >
              Reject
            </button>
          )}
          {onRedeem && (
            <button
              onClick={() => onRedeem(voucher)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
            >
              Redeem
            </button>
          )}
          {onSwap && (
            <button
              onClick={() => onSwap(voucher)}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition"
            >
              Swap
            </button>
          )}
        </div>
      </div>

      {showModal && <VoucherModal voucher={voucher} role={role} userBalance={userBalance} onClose={() => setShowModal(false)} />}
    </>
  );
}
