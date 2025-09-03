import React from "react";
import { Link } from "react-router-dom";
// import ConnectWallet from "../components/ConnectWallet";

export default function ConnectPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>VoucherSwap — Connect</h1>
      {/* <ConnectWallet /> */}
      <hr />
      <p>Quick links (placeholders):</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/merchant"><button>Go to Merchant</button></Link>
        <Link to="/admin"><button>Go to Admin</button></Link>
        <Link to="/marketplace"><button>Go to Marketplace</button></Link>
      </div>
    </div>
  );
}
