import React from "react";
import { useWallet } from "../Context/WalletContext.jsx";
import metamaskIcon from "../public/images/metamask-icon.png";
import { useRole } from "../Context/RoleContext.jsx";

export default function ConnectPage() {
  const { role } = useRole();
  const { connectWallet } = useWallet();

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: `linear-gradient(135deg, rgba(76, 9, 147, 0.94), rgba(10, 24, 128, 0.94)),
      url(${metamaskIcon}) center/95% no-repeat`,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "55px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      animation: "fadeIn 0.3s ease-out"
    }}>
      <div className="brand text-[70px]">
        VoucherSwap
      </div>
      <div style={{
        background: "rgba(255, 255, 255, 0.04)",
        padding: "51px",
        borderRadius: "24px",
        width: "510px",
        maxWidth: "90vw",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center",
        backdropFilter: "blur(14px)",
        animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}>
        <div style={{
          width: "100px",
          height: "100px",
          margin: "0 auto 28px",
          background: "linear-gradient(135deg, #1798c6ff 0%, #82cf6aff 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 18px rgba(246, 133, 27, 0.35)"
        }}>
          <img src={metamaskIcon} alt="MetaMask" width="72" height="72" />
        </div>

        <h2 style={{
          marginBottom: "18px",
          color: "white",
          fontSize: "35px",
          fontWeight: 900,
          letterSpacing: "0.8px"
        }}>
          Connect Your Wallet
        </h2>

        <p style={{
          marginBottom: "42px",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "18px",
          lineHeight: "1.6"
        }}>
          To continue using this application, please connect your MetaMask wallet.
        </p>

        <button
          onClick={() => connectWallet(role)}
          style={{
            padding: "18px 28px",
            width: "100%",
            background: "linear-gradient(135deg, #d66902ff 55%, #e46c11ff 100%)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "19px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 5px 14px rgba(230, 118, 37, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 7px 18px rgba(230, 118, 37, 0.55)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 5px 14px rgba(230, 118, 37, 0.4)";
          }}
        >
          Connect MetaMask
        </button>

        <p style={{
          marginTop: "24px",
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "15.4px",
          lineHeight: "1.5"
        }}>
          By connecting, I accept the Terms of Service and Privacy Policy
        </p>

        <div style={{
          marginTop: "40px",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <p style={{
            margin: "0 0 10px 0",
            color: "rgba(255, 255, 240, 0.57)",
            fontSize: "18.4px"
          }}>
            New to Ethereum wallets?
          </p>
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#F6851B",
              textDecoration: "none",
              fontSize: "17.5px",
              fontWeight: 500,
              transition: "color 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.color = "#FF9D3D";
              e.target.style.textDecoration = "underline";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "#F6851B";
              e.target.style.textDecoration = "none";
            }}
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
