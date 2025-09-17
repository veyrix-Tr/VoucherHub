import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

// context define to use anywhere
const WalletContext = createContext();

//cotext-provider which would wrap entire code and give it these all values of account, signer, provider, connectWallet means when in entire children or wrapped code we want to use this, we can use it by useContext            
// means just defines values and functions and give to context to use in provider
export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const navigate = useNavigate();  

    const connectWallet = async () => {
        /** 
         * Safely check if running in browser and MetaMask (window.ethereum) is available
         * we are not using !window because in Node.js or any non-browser environment, window does not exist so would say 
            ReferenceError: window is not defined
         means would ask which window are you talking about
        */ 
        if (typeof window === "undefined" || !window.ethereum) {
            alert("Please Install MetaMask");
        } else {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });

                // read-only connection which allows querying the blockchain state or event logs, needed when interact with contracts
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                // get signer from the blockchain which would help to sign vouchers
                const signer = provider.getSigner();

                // show connected wallet
                const address = await signer.getAddress();
                setProvider(provider);
                setSigner(signer);
                setAccount(address);
                navigate("/merchant")
            } catch (error) {
                console.error(error.message);
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