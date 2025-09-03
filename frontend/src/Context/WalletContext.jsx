import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

// context define to use anywhere
const WalletContext = createContext();

//cotext-provider which would wrap entire code and give it these all values of account, signer, provider, connectWallet means when in entire children or wrapped code we want to use this, we can by useContext            
// means just defines values and functions and give to context to use in provider
export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);

    const connectWallet = async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            alert("Please Install MetaMask");
        } else {
            try {
                // unlock metamask
                await window.ethereum.request({ method: "eth_requestAccounts" });

                // read-only connection which allows querying the blockchain state or event logs, needed when interact with contracts
                const provider = new ethers.BrowserProvider(window.ethereum);

                // get signer from the blockchain which would help to sign vouchers
                const signer = await provider.getSigner();

                // show connected wallet
                const address = await signer.getAddress();
                setProvider(provider);
                setSigner(signer);
                setAccount(address);
            } catch (error) {
                console.error(err.message);
            }
        }
    }
    return (
        <WalletContext.Provider value={{ account, signer, provider, connectWallet }}>
            {children}
        </WalletContext.Provider>
    )
}

// a function to use values in WalletContext
export const useWallet = () => useContext(WalletContext);