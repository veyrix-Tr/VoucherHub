import React, { useState, useEffect } from 'react';
import githubIcon from "../../public/images/github-icon.png";
import { useWallet } from "../../Context/WalletContext.jsx";
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Marketplace from '../../Pages/Marketplace.jsx';
import UserPage from '../../Pages/UserPage.jsx';
import AdminPage from '../../Pages/AdminPage.jsx';
import MerchantPage from '../../Pages/MerchantPage.jsx';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();
  const isWalletConnected = Boolean(account);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');

  let currentRole = "user";
  if (location.pathname.startsWith("/admin")) currentRole = "admin";
  else if (location.pathname.startsWith("/merchant")) currentRole = "merchant";
  else if (location.pathname.startsWith("/user")) currentRole = "user";

  const isMarketplacePage = location.pathname.startsWith("/marketplace");

  const roleConfig = {
    admin: { page: AdminPage, displayName: 'Admin', gradient: 'from-red-500 to-red-600' },
    merchant: { page: MerchantPage, displayName: 'Merchant', gradient: 'from-green-400 to-indigo-800' },
    user: { page: UserPage, displayName: 'User', gradient: 'from-green-600 to-green-500' }
  };

  const RenderPage = activePage === "home" ? roleConfig[currentRole].page : Marketplace;
  useEffect(() => {
    if (location.pathname === '/user') {
      setActivePage('marketplace');
    } else {
      setActivePage('home');
    }
  }, [location]);

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(account);
    setIsDropdownOpen(false);
    toast.success("Address copied to clipboard !", {
      className: "text-[14px] font-semibold",
      autoClose: 2000,
      pauseOnHover: false,
    });
  };

  return (
    <div>
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-md bg-opacity-90 shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-black bg-opacity-20 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
              {/* Placeholder for logo - replace with your image */}
              <img src={""} alt="" className='w-7 absolute' />
            </div>
            <button
              onClick={() => setActivePage("home")}
              className="flex items-center gap-2 brand text-[40px]"
            >
              VoucherSwap
            </button>

          </div>

          <div className="flex items-center space-x-9">
            <button
              onClick={() => setActivePage("home")}
              className={`relative px-3 py-2 rounded-md text-[20px] font-medium transition-colors duration-200 ${activePage === "home" ? "text-white font-bold" : "text-gray-300 hover:text-white"}`}
            >
              Home
              {activePage === "home" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transition-all duration-300"></span>
              )}
            </button>

            <button
              onClick={() => setActivePage("marketplace")}
              className={`relative px-3 py-2 rounded-md text-[20px] font-medium transition-colors duration-200 ${activePage === "marketplace" ? "text-white font-bold" : "text-gray-300 hover:text-white"}`}
            >
              Marketplace
              {activePage === "marketplace" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transition-all duration-300"></span>
              )}
            </button>

            <a href="https://github.com/veyrix-Tr/VoucherSwap/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex">
              <img src={githubIcon} alt="" className='w-7 absolute' />
              <span className='relative pt-1 pl-9 text-[19px]'>GitHub Repo</span>
            </a>
          </div>

          <div className="flex items-center space-x-16">
            <div className={`flex items-center px-3 py-1 rounded-full text-yellow-100 bg-gradient-to-r ${roleConfig[currentRole].gradient} shadow-md flex items-center space-x-2`}>
              <span className={`text-[20px] font-bold tracking-wide px-2 pt-1`}>
                {roleConfig[currentRole].displayName}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => isWalletConnected ? setIsDropdownOpen(!isDropdownOpen) : connectWallet()}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-400 to-green-500 text-yellow-100 hover:opacity-90 px-4 py-2 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
              >
                {isWalletConnected ? (
                  <span className="text-[18px] font-bold">
                    {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                  </span>
                ) : (
                  <span className="text-[18px] font-bold">Connect Wallet</span>
                )}
              </button>


              {isDropdownOpen && isWalletConnected && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <button onClick={copyAddressToClipboard} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    Copy Address
                  </button>
                  <button onClick={() => { disconnectWallet(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-4">
        {<RenderPage />}
      </div>
    </div>
  );
};

export default Navbar;