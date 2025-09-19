import React from "react";
import MyVouchers from "../Components/user/MyVouchers.jsx";
import RedeemVoucher from "../Components/user/RedeemVoucher.jsx";
import RequestMerchantForm from "../Components/user/RequestMerchantForm.jsx";

export default function UserPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Dashboard</h1>
      <MyVouchers />
      <RedeemVoucher />
      <RequestMerchantForm />
    </div>
  );
}
