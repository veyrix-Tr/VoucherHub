import React, { useEffect, useState } from "react";
import { useWallet } from "../../Context/WalletContext.jsx";
import { fetchVouchersByOwner } from "../../utils/fetchVouchers.js";
import RedeemVoucher from "./RedeemVoucher.jsx";
import VoucherCard from "../common/VoucherCard.jsx";

export default function MyVouchers() {
  const { account } = useWallet();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  // the voucher we have selected for redeem, means it would pop up the redeem page for that
  const [redeemingVoucher, setRedeemingVoucher] = useState(null);

  useEffect(() => {
    if (account) {
      fetchVouchersByOwner(account, setVouchers, setLoading);
    }
  }, [account]);

  const now = Math.floor(Date.now() / 1000);
  const activeVouchers  = vouchers.filter((v) => v.status !== "redeemed" && Number(v.expiry) > now);
  const expiredVouchers = vouchers.filter((v) => v.status !== "redeemed" && Number(v.expiry) <= now);
  const redeemedVouchers = vouchers.filter((v) => v.status === "redeemed");

  const refresh = () => {
    if (account) {
      fetchVouchersByOwner(account, setVouchers, setLoading);
    } else {
      alert("Please connect your wallet first!");
    }
  }

  const handleRedeemSuccess = () => {
    setRedeemingVoucher(null);
    refresh();
  };

  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">My Vouchers</h2>
        <button onClick={() => refresh()} className="px-4 py-2 bg-blue-200 rounded text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading vouchers...</p>
      ) : (
        <>
          <VoucherSection
            title={`Active`}
            items={activeVouchers}
            onRedeem={setRedeemingVoucher}
          />
          <VoucherSection
            title={`Expired`}
            items={expiredVouchers}
          />
          <VoucherSection
            title={`Redeemed`}
            items={redeemedVouchers}
          />
        </>
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

function VoucherSection({ title, items, onRedeem }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{`${title} (${items.length})`}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No vouchers</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(v => (
            <VoucherCard
              key={v._id}
              voucher={v}
              role="user"
              userBalance={v.balance || 0}
              onRedeem={onRedeem} />
          ))}
        </div>
      )}
    </div>
  )
}