import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const WALLET_STORAGE_KEY = "voucher_swap_wallet_state";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        setIsInitializing(false);
        return;
      }

      try {
        const savedState = localStorage.getItem(WALLET_STORAGE_KEY);
        if (savedState) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = accounts[0];
            
            setProvider(provider);
            setSigner(signer);
            setAccount(address);
            
            localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ 
              account: address 
            }));
          }
        }
      } catch (error) {
        console.error("Failed to restore wallet connection:", error);
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    checkWalletConnection();

    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (account && accounts[0].toLowerCase() !== account.toLowerCase()) {
        setAccount(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [account]);

  const connectWallet = async (role) => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Please Install MetaMask");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = accounts[0];
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ 
        account: address 
      }));

      toast.success("Wallet connected!", {
        className: "font-[400]",
        duration: 1500,
        showProgressBar: true
      });

      if (role) {
        navigate(`/${role}`);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setProvider(null);
    setSigner(null);
    setAccount(null);
    
    toast("Wallet disconnected!", {
      icon: "⚡",
      duration: 1500,
      showProgressBar: true
    });
    
    navigate("/");
  };

  return (
    <WalletContext.Provider value={{ 
      account, 
      signer, 
      provider, 
      connectWallet, 
      disconnectWallet,
      isInitializing
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};