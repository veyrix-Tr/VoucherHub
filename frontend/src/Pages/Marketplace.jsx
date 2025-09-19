import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../Context/WalletContext.jsx";
import { fetchVouchersByStatus } from "../utils/fetchVouchers.js";

export default function Marketplace() {

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false)

  const { account } = useWallet();

  useEffect(() => {
    fetchVouchersByStatus("approved", setVouchers, setLoading);
  }, [account])

  return (
    <div style={{ padding: 24 }}>
      <h1>Marketplace</h1>

      {loading ? (
        <p>Loading vouchers...</p>
      ) : vouchers.length === 0 ? (
        <p>No approved vouchers found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {vouchers.map(v => {
            if (!v.metadata) {
              return (
                <div key={v._id} className="border rounded-lg p-3 shadow text-red-500">
                  Metadata missing
                </div>
              );
            }
            const expiry = new Date(v.metadata.expiry).toLocaleString();

            return (
              <div key={v._id} className="border rounded-lg p-3 shadow">
                {v.imageUrl ? (
                  <img
                    src={v.imageUrl}
                    alt={v.metadata.name || "Voucher"}
                    className="w-full h-48 object-cover rounded-md shadow-sm"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}
                <h3 className="font-bold mt-2">{v.metadata.name || "Unnamed Voucher"}</h3>
                <p className="text-sm text-gray-600">{v.metadata.description}</p>
                <p>Price: {v.price} wei</p>
                <p>Expiry: {expiry}</p>
              </div>
            )
          })}
        </div>
      )}
      <Link to="/">
        <button className="mt-6 px-4 py-2 bg-gray-500 text-white rounded">Back</button>
      </Link>
    </div>
  );
}
