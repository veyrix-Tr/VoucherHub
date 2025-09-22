import React from "react";
import discordIcon from "../../public/images/Discord-icon.png"
import githubIcon from "../../public/images/github-icon.png"
import twitterIcon from "../../public/images/twitter-icon.png"

export default function Footer({ currentRole = 'user' }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                {/* logo */}
                <img src="" alt="VoucherSwap logo" className="w-8 h-8 object-contain filter brightness-0 invert" />
              </div>
              <div>
                <h2 className="text-[35px] font-extrabold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  VoucherSwap
                </h2>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-sm text-gray-400">by</span>
                  <span className="text-lg font-extrabold bg-clip-text text-yellow-400  tracking-tight" style={{ fontFamily: "'Style Script', sans-serif", letterSpacing: '3px' }} >
                    Veyrix-Tr
                    <span className="text-[20px] font-[100] bg-clip-text text-yellow-400 via-pink-500 to-yellow-400 tracking-tight pl-2" style={{ fontFamily: "Bungee", letterSpacing: '-0.3px' }}>
                      ( Chirag Goyal )
                    </span>
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Trustless voucher exchange protocol</p>
              </div>
            </div>

            <p className="text-gray-300 text-[19px] max-w-md leading-relaxed mb-6 pb-6">
              Securely issue, receive, and redeem ERC-1155 vouchers on-chain.
              Built for decentralized commerce with enterprise-grade security.
            </p>

            <div className="flex items-center justify-content gap-3">
              <a href="https://github.com/veyrix-Tr/VoucherSwap" target="_blank" rel="noopener noreferrer"
                className="flex items-center group p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-lg h-11 w-11">
                <img src={githubIcon} alt="GitHub" />
              </a>

              <a href="https://x.com/veyrix_Tr" target="_blank" rel="noopener noreferrer"
                className="flex items-center group p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-lg h-11 w-11">
                <img src={twitterIcon} alt="Discord" />
              </a>

              <a href="https://discord.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center group p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-lg h-11 w-11">
                <img src={discordIcon} alt="Discord" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Product
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              <li><a href="/marketplace" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-purple-500"></span>
                Marketplace
              </a></li>
              <li><a href={`/${currentRole}`} className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-purple-500"></span>
                Dashboard
              </a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Resources
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h3>
            <ul className="space-y-3">
              <li><a href="https://github.com/veyrix-Tr/VoucherSwap/blob/main/README.md" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-500"></span>
                Documentation
              </a></li>
              <li><a href="https://github.com/veyrix-Tr" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-500"></span>
                GitHub
              </a></li>
              <li><a href="https://x.com/veyrix_Tr" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-blue-500"></span>
                Support
              </a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © {year} VoucherSwap Protocol. All rights reserved.
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a href="" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="" className="text-gray-400 hover:text-white transition-colors duration-200">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}