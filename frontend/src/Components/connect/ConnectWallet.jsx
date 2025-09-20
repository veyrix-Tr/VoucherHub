import React from "react";
import { useWallet } from "../../Context/WalletContext.jsx";

// react component which gets account-address and connectWallet function from useWallet and return a component which would render account address or the Connect Wallet button
export default function ConnectWallet() {
  const { account, connectWallet } = useWallet();

  return (
    <button onClick={connectWallet}>
      {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
    </button>
  );
}
