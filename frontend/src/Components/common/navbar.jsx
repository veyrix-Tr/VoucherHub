import React, { useState, useEffect } from 'react';
import githubIcon from "../../public/images/github-mark-white.png";

const Navbar = ({ currentRole = 'admin', isMarketplacePage = false }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const connected = localStorage.getItem('walletConnected') === 'true';
    if (connected) {
      setIsWalletConnected(true);
      setWalletAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    }
  }, []);

  const connectWallet = () => {
    setIsWalletConnected(true);
    setWalletAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    localStorage.setItem('walletConnected', 'true');
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
    setIsDropdownOpen(false);
    localStorage.removeItem('walletConnected');
  };

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsDropdownOpen(false);
  };

  const roleConfig = {
    admin: { homeUrl: '/admin', displayName: 'Admin', gradient: 'from-pink-400 to-red-600' },
    merchant: { homeUrl: '/merchant', displayName: 'Merchant', gradient: 'from-orange-500 to-orange-800' },
    user: { homeUrl: '/dashboard', displayName: 'User', gradient: 'from-blue-400 to-yellow-600'}
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-md bg-opacity-90 shadow-lg p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black bg-opacity-20 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-200">
            {/* Placeholder for logo - replace with your image */}
            <img src={""} alt="" className='w-7 absolute' />
          </div>
          <a href={roleConfig[currentRole].homeUrl} className="text-white font-bold text-2xl tracking-tight">
            VoucherSwap
          </a>
        </div>

        <div className="flex items-center space-x-9">
          {isMarketplacePage ? (
            <a href={roleConfig[currentRole].homeUrl} className="text-white hover:text-blue-100 px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              Back to {roleConfig[currentRole].displayName} {currentRole === 'admin' ? 'Panel' : 'Dashboard'}
            </a>
          ) : (
            <a href="/marketplace" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-[20px] font-medium transition-colors duration-200">
              Marketplace
            </a>
          )}

          <a href="https://github.com/veyrix-Tr/VoucherSwap/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex">
            <img src={githubIcon} alt="" className='w-7 absolute' />
            <span className='relative pt-1 pl-9 text-[19px]'>GitHub Repo</span>
          </a>
        </div>

        <div className="flex items-center space-x-15">
          <div className={`px-3 py-1 rounded-full text-white bg-gradient-to-r ${roleConfig[currentRole].gradient} shadow-md flex items-center space-x-2`}>
            <span className={`text-[18px] font-medium tracking-wide`}>
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
                  {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                </span>
              ) : (
                <span className="text-sm font-medium">Connect Wallet</span>
              )}
            </button>


            {isDropdownOpen && isWalletConnected && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button onClick={copyAddressToClipboard} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Copy Address
                </button>
                <button onClick={disconnectWallet} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;