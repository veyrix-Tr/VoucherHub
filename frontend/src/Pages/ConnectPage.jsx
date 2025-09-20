import React from "react";
import { useWallet } from "../Context/WalletContext.jsx";

export default function ConnectPage() {
  const { account, connectWallet } = useWallet();

  if (account) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: `
        linear-gradient(1frontend/src/utils/1683020955metamask-icon-png.png35deg, rgba(12,15,29,0.95) 0%, rgba(28,32,60,0.95) 100%)`,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      animation: "fadeIn 0.3s ease-out"
    }}>
      
      <div style={{
        background: "rgba(255, 255, 255, 0.05)",
        padding: "35px",
        borderRadius: "20px",
        width: "390px",
        maxWidth: "90vw",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center",
        backdropFilter: "blur(12px)",
        animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          margin: "0 auto 20px",
          background: "linear-gradient(135deg, #F6851B 0%, #DF6C0C 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 15px rgba(246, 133, 27, 0.3)"
        }}>
          <img src="../utils/1683020955metamask-icon-png.png" alt="MetaMask" width="40" height="40" />
        </div>

        <h2 style={{
          marginBottom: "12px",
          color: "white",
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "0.5px"
        }}>
          Connect Your Wallet
        </h2>

        <p style={{
          marginBottom: "28px",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "15px",
          lineHeight: "1.5"
        }}>
          To continue using this application, please connect your MetaMask wallet.
        </p>

        <button
          onClick={connectWallet}
          style={{
            padding: "14px 24px",
            width: "100%",
            background: "linear-gradient(135deg, #F6851B 0%, #E27625 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(230, 118, 37, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 16px rgba(230, 118, 37, 0.5)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(230, 118, 37, 0.4)";
          }}
        >
          Connect MetaMask
        </button>

        <p style={{
          marginTop: "20px",
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "12px",
          lineHeight: "1.4"
        }}>
          By connecting, I accept the Terms of Service and Privacy Policy
        </p>

        <div style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <p style={{
            margin: "0 0 8px 0",
            color: "rgba(255, 255, 240, 0.5)",
            fontSize: "15px"
          }}>
            New to Ethereum wallets?
          </p>
          <a 
            href="https://metamask.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{color: "#F6851B",textDecoration: "none",fontSize: "15px",fontWeight: 500,transition: "color 0.2s ease"}}
            onMouseOver={(e) => e.target.style.color = "#FF9D3D"}
            onMouseOut={(e) => e.target.style.color = "#F6851B"}
          >
            Learn more
          </a>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}