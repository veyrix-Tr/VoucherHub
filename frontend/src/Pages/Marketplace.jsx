import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../Context/WalletContext.jsx";
import { fetchVouchersByStatus } from "../utils/fetchVouchers.js";
import VoucherCard from "../Components/common/VoucherCard.jsx";

export default function Marketplace() {

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false)
  const { account } = useWallet();

  useEffect(() => {
    fetchVouchersByStatus("approved", setVouchers, setLoading);
  }, [account])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Marketplace</h1>
      <button
        onClick={() => fetchVouchersByStatus("approved", setVouchers, setLoading)}
        disabled={loading}
        className="px-4 py-2 bg-blue-200 rounded text-sm disabled:opacity-50"
      >
        Refresh
      </button>

      {loading ? (
        <div className="text-center text-gray-500">Loading vouchers...</div>
      ) : vouchers.length === 0 ? (
        <div className="text-center text-gray-500">No approved vouchers found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((v) => (
            <VoucherCard key={v._id} voucher={v} role="marketplace" />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Back
          </button>
        </Link>
      </div>
    </div>
  );
}
