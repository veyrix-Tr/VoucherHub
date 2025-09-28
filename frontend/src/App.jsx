import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";

import ConnectPage from "./Pages/ConnectPage.jsx";
import MerchantPage from "./Pages/MerchantPage.jsx";
import AdminPage from "./Pages/AdminPage.jsx";
import Marketplace from "./Pages/Marketplace.jsx";
import ConnectWallet from "./Components/connect/ConnectWallet.jsx";
import UserPage from "./Pages/UserPage.jsx";
import AdminMerchantRequests from "./Components/admin/AdminMerchantRequests.jsx";
import { Layout } from "./Components/common/Layout.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route element={<Layout />}>
          <Route path="/merchant" element={<MerchantPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/merchant-requests" element={<AdminMerchantRequests />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/wallet" element={<ConnectWallet />} />
          <Route path="/user" element={<UserPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
