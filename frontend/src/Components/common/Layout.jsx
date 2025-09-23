import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { useRole } from "../../Context/RoleContext.jsx";

export function Layout() {
  const location = useLocation();
  const { role, setRole } = useRole();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) setRole("admin");
    else if (location.pathname.startsWith("/merchant")) setRole("merchant");
    else if (location.pathname.startsWith("/user")) setRole("user");
  }, [location.pathname, setRole]);

  const roleConfig = {
    admin: { displayName: "Admin", gradient: "from-red-500 to-red-600" },
    merchant: { displayName: "Merchant", gradient: "from-green-400 to-indigo-800" },
    user: { displayName: "User", gradient: "from-green-600 to-green-500" },
  };

  return (
    <div>
      <Navbar currentRole={role} roleConfig={roleConfig} />
      <div className="mt-4"><Outlet /></div>
      <Footer />
    </div>
  );
}
