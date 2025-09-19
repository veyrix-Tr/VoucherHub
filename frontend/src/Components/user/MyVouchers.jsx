import React, { useEffect, useState } from "react";
import { useWallet } from "../../Context/WalletContext.jsx";
import { fetchVouchersByOwner } from "../../utils/fetchVouchers.js";
import RedeemVoucher from "./RedeemVoucher.jsx";

export default function MyVouchers() {
  const { account } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  // the voucher we have selected for see, means it would pop up the voucher
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  // the voucher we have selected for redeem, means it would pop up the redeem page for that
  const [redeemingVoucher, setRedeemingVoucher] = useState(null);

  useEffect(() => {
    if (account) {
      fetchVouchersByOwner(account, setVouchers, setLoading);
    }
  }, [account]);

  const now = Math.floor(Date.now() / 1000);
  const activeVouchers = vouchers.filter((v) => v.status !== "redeemed" && Number(v.expiry) > now);
  const expiredVouchers = vouchers.filter((v) => v.status !== "redeemed" && Number(v.expiry) <= now);
  const redeemedVouchers = vouchers.filter((v) => v.status === "redeemed");

  const handleRedeemSuccess = () => {
    setRedeemingVoucher(null);
    fetchVouchersByOwner(account, setVouchers, setLoading);
  };

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">My Vouchers</h2>
        <button
          onClick={() => fetchVouchersByOwner(account, setVouchers, setLoading)}
          className="px-3 py-1 bg-gray-100 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading vouchers...</p>
      ) : (
        <>
          <VoucherSection
            title={`Active (${activeVouchers.length})`}
            items={activeVouchers}
            onOpen={setSelectedVoucher}
            onRedeem={setRedeemingVoucher}
          />
          <VoucherSection
            title={`Expired (${expiredVouchers.length})`}
            items={expiredVouchers}
            onOpen={setSelectedVoucher}
          />
          <VoucherSection
            title={`Redeemed (${redeemedVouchers.length})`}
            items={redeemedVouchers}
            onOpen={setSelectedVoucher}
          />
        </>
      )}

      {selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-lg w-full">
            <div className="flex justify-between">
              <h3 className="text-lg font-bold">{selectedVoucher.metadata?.name || "Voucher"}</h3>
              <button onClick={() => setSelectedVoucher(null)} className="text-gray-500">Close</button>
            </div>
            <p className="text-sm text-gray-600">{selectedVoucher.metadata?.description}</p>
          </div>
        </div>
      )}

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

function VoucherSection({ title, items, onOpen, onRedeem }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      {items.length === 0 ? (
        <div className="text-gray-500">None</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((v) => (
            <div key={v._id} className="border rounded-lg p-3 bg-white shadow-sm flex flex-col">
              <div className="h-36 bg-gray-50 rounded flex items-center justify-center">
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt={v.metadata?.name} className="object-cover w-full h-full" />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <div className="mt-2 font-semibold">{v.metadata?.name}</div>
              <div className="text-xs text-gray-500">
                {v.metadata?.description?.slice(0, 80)}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <button onClick={() => onOpen(v)} className="text-blue-600 underline text-sm">
                  View
                </button>
                {onRedeem && title.startsWith("Active") && (
                  <button
                    onClick={() => onRedeem(v)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                  >
                    Redeem
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}