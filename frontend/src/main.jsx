import React from "react";
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { WalletProvider } from "./Context/WalletContext.jsx";

import './index.css'
import App from './App.jsx'
import { RoleProvider } from "./Context/RoleContext.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <WalletProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </WalletProvider>
  </BrowserRouter>
)
