import React from "react";
import { useWallet } from "../Context/WalletContext.jsx";

export default function ConnectPage() {
  const { account, connectWallet, } = useWallet();

  // If connected, render nothing (no gate). If not, render full-page modal.
  if (account) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", padding: 24, borderRadius: 8, width: 420 }}>
        <h2 style={{ marginBottom: 8 }}>Connect Wallet</h2>
        <p style={{ marginBottom: 16 }}>Please connect your wallet to continue.</p>
        <button onClick={connectWallet} style={{ padding: "8px 16px" }}>
          Connect MetaMask
        </button>
      </div>
    </div>
  );
}
