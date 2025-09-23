import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export function Layout() {
  const location = useLocation();

  let currentRole = "user";
  if (location.pathname.startsWith("/admin")) currentRole = "admin";
  else if (location.pathname.startsWith("/merchant")) currentRole = "merchant";
  else if (location.pathname.startsWith("/user")) currentRole = "user";

  const roleConfig = {
    admin: { displayName: "Admin", gradient: "from-red-500 to-red-600" },
    merchant: { displayName: "Merchant", gradient: "from-green-400 to-indigo-800" },
    user: { displayName: "User", gradient: "from-green-600 to-green-500" },
  };

  return (
    <div>
      <Navbar currentRole={currentRole} roleConfig={roleConfig} />

      {/* Page content */}
      <div className="mt-4">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
