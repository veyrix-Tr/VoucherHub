import React from "react";
import { Routes, Route } from "react-router-dom";
import ConnectPage from "./Pages/ConnectPage.jsx";
import MerchantPage from "./Pages/MerchantPage.jsx";
import AdminPage from "./Pages/AdminPage.jsx";
import Marketplace from "./Pages/Marketplace.jsx";
import ConnectWallet from "./Components/ConnectWallet.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ConnectPage />} />
      <Route path="/merchant" element={<MerchantPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/wallet" element={<ConnectWallet />} />

    </Routes>
  );
}
