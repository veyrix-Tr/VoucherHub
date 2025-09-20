import React from "react";

export default function VoucherModal({ voucher, role, userBalance, onClose }) {
  if (!voucher) return null;

  const expiryDate = voucher.expiry
    ? new Date(Number(voucher.expiry) * 1000).toLocaleString()
    : voucher.metadata?.expiry
      ? new Date(voucher.metadata.expiry).toLocaleString()
      : "N/A";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{voucher.metadata?.name || "Voucher"}</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            close
          </button>
        </div>

        {voucher.imageUrl && (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center p-4">
            <img
              src={voucher.imageUrl}
              alt={voucher.metadata?.name}
              className="object-contain max-h-full w-full rounded"
            />
          </div>
        )}

        <div className="p-4 space-y-2 text-gray-700">
          <p><span className="font-semibold">Description:</span> {voucher.metadata?.description || "N/A"}</p>
          <p><span className="font-semibold">Voucher ID:</span> {voucher.voucherId || "N/A"}</p>
          <p><span className="font-semibold">Merchant:</span> {voucher.merchant || "N/A"}</p>
          <p><span className="font-semibold">Price:</span> {voucher.price || "N/A"}</p>

          {role === "user" && userBalance !== undefined ? (
            <p><span className="font-semibold">You own:</span> {userBalance}</p>
          ) : (
            <p><span className="font-semibold">Max Mint:</span> {voucher.maxMint || "N/A"}</p>
          )}
          <p><span className="font-semibold">Expiry:</span> {expiryDate}</p>
          {voucher.metadataCid && (
            <p>
              <span className="font-semibold">Metadata CID:</span>{" "}
              <a
                href={`https://ipfs.io/ipfs/${voucher.metadataCid}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {voucher.metadataCid.slice(0, 10)}...
              </a>
            </p>
          )}
          <p><span className="font-semibold">Status:</span> {voucher.status || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
