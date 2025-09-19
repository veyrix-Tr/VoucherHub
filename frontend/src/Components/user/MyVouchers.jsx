// src/pages/MyVouchers.jsx
import React, { useEffect, useState } from "react";
import { useWallet } from "../../Context/WalletContext.jsx";
import { fetchVouchersByOwner } from "../../utils/fetchVouchers.js";

export default function MyVouchers() {
  const { account } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      fetchVouchersByOwner(account, setVouchers, setLoading);
    }
  }, [account]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        My Vouchers ({account ? account.slice(0, 6) + "..." + account.slice(-4) : "Not Connected"})
      </h1>

      {loading ? (
        <p>Loading your vouchers...</p>
      ) : vouchers.length === 0 ? (
        <p>You don’t own any vouchers yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v) => {
            const expiry = v.metadata?.expiry
              ? new Date(v.metadata.expiry).toLocaleString()
              : "N/A";

            return (
              <div key={v._id || v.voucherId} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                {v.imageUrl ? (
                  <img
                    src={v.imageUrl}
                    alt={v.metadata?.name || "Voucher"}
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded">
                    No Image
                  </div>
                )}

                <h3 className="font-bold mt-2">{v.metadata?.name || "Unnamed Voucher"}</h3>
                <p className="text-sm text-gray-600">{v.metadata?.description || "No description"}</p>

                <p className="mt-1 text-sm">Price: {v.price} wei</p>
                <p className="text-sm">Expiry: {expiry}</p>

                {/* Redeem button (not wired yet) */}
                <button className="mt-3 w-full bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
