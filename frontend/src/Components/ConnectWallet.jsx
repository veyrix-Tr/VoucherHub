import React from "react";
import { useWallet } from "../Context/WalletContext.jsx";

export default function ConnectWallet() {
  const { account, connectWallet } = useWallet();

  return (
    <button onClick={connectWallet}>
      {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
