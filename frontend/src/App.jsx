import React from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";

import ConnectPage from "./Pages/ConnectPage.jsx";
import MerchantPage from "./Pages/MerchantPage.jsx";
import AdminPage from "./Pages/AdminPage.jsx";
import Marketplace from "./Pages/Marketplace.jsx";
import UserPage from "./Pages/UserPage.jsx";
import AdminMerchantRequests from "./Components/admin/AdminMerchantRequests.jsx";
import { Layout } from "./Components/common/Layout.jsx";
import ProtectedRoute from "./Components/common/ProtectedRoute.jsx";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route element={<Layout />}>
          <Route path="/merchant" element={
            <ProtectedRoute requiredRole="merchant">
              <MerchantPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/merchant-requests" element={
            <ProtectedRoute requiredRole="admin">
              <AdminMerchantRequests />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/user" element={<UserPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
