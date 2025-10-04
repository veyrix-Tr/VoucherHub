# VoucherHub - Decentralized Voucher Marketplace

<div align="center">

**A complete Web3 solution for creating, issuing, redeeming, and managing digital vouchers on the blockchain**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19-green.svg)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-red.svg)](https://soliditylang.org/)

</div>

## 🌟 Overview

VoucherHub is a great decentralized platform that enables merchants to create, distribute, and manage digital vouchers and users to get and redeem them using blockchain technology. Built with modern Web3 technologies, it provides a secure, transparent, and efficient way to handle voucher transactions without intermediaries.

### ✨ Key Features

- **🏪 Merchant Registration**: Secure merchant onboarding with admin approval
- **🎟️ Voucher Creation**: Create digital vouchers with custom metadata and pricing
- **🔐 Secure Issuing**: EIP712 signature-based voucher issuing system
- **💰 Marketplace**: Browse vouchers and approach respective merchants for purchase
- **🔄 Redemption System**: Easy voucher redemption with burn mechanism
- **👨‍💼 Admin Dashboard**: Complete admin control over merchant approvals and voucher management
- **📱 Responsive UI**: Modern interface built with React and Tailwind CSS

## 🏗️ Architecture

VoucherHub follows a modern three-tier architecture:

```
┌───────────────────┐    ┌─────────────────┐    ┌───────────────────┐
│   Frontend        │    │    Backend      │    │ Smart Contracts   │
│   (React)         │◄──►│   (Node.js)     │◄──►│   (Solidity)      │
│                   │    │                 │    │                   │
│ • User Interface  │    │ • API Server    │    │ • VoucherERC1155  │
│ • Web3 Integration│    │ • Database      │    │ • MerchantRegistry│
│ • Wallet Connect  │    │ • Authentication│    │ • OpenZeppelin    │
└───────────────────┘    └─────────────────┘    └───────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Ethers.js 5.8.0** - Ethereum interaction library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js 20.19** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Helmet** - Security middleware

### Smart Contracts
- **Solidity 0.8.20** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Security-audited contract libraries
- **ERC1155** - Multi-token standard
- **EIP712** - Typed structured data signing

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Development server
- **Pinata (IPFS)** - Decentralized storage & pinning service
- **Foundry** - Smart contract development framework

## 📁 Project Structure

```
VoucherHub/
├── 📂 frontend/                 # React frontend application
│   ├── 📂 src/
│   │   ├── 📂 Components/       # Reusable UI components
│   │   │   ├── 📂 admin/        # Admin-specific components
│   │   │   ├── 📂 common/       # Shared components
│   │   │   ├── 📂 connect/      # Wallet connection
│   │   │   ├── 📂 merchant/     # Merchant dashboard
│   │   │   └── 📂 user/         # User interface
│   │   ├── 📂 Context/          # React context providers
│   │   ├── 📂 Pages/            # Application pages
│   │   └── 📂 utils/            # Utility functions & IPFS
│   ├── package.json
│   └── vite.config.js
├── 📂 backend/                  # Express.js backend server
│   ├── 📂 src/
│   │   ├── 📂 config/           # Database configuration
│   │   ├── 📂 controllers/      # Request handlers
│   │   ├── 📂 middleware/       # Authentication & validation
│   │   ├── 📂 models/           # Database models
│   │   └── 📂 routes/           # API routes
│   ├── package.json
│   └── server.js
├── 📂 contracts/                # Smart contracts
│   ├── 📂 src/                  # Solidity contracts
│   │   ├── VoucherERC1155.sol   # Main voucher contract
│   │   └── MerchantRegistry.sol # Merchant management
│   ├── 📂 script/               # Deployment scripts
│   ├── 📂 test/                 # Contract tests
│   └── foundry.toml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20.19 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** or compatible Web3 wallet
- **MongoDB** (local or cloud instance)
- **Pinata Account** (for IPFS storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/veyrix-Tr/VoucherHub.git
   cd VoucherHub
   ```

2. **Install dependencies for all components**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   
   # Install contract dependencies
   cd ../contracts
   forge install
   forge build
   ```

3. **Environment Setup**

   **Frontend (.env)**
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   VITE_CHAIN_ID=11155111
   VITE_PINATA_JWT=your_pinata_jwt_token
   VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
   ```

   **Backend (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/voucherhub
   JWT_SECRET=your_jwt_secret_key # Note: JWT authentication currently disabled for development
   RPC_URL=your_rpc_url
   CHAIN_ID=11155111
   ```

4. **Start the servers**

   **Terminal 1 - Backend**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 📋 Smart Contract Details

### VoucherERC1155
The main contract that handles voucher creation, minting, and redemption.

**Key Functions:**
- `mintFromVoucher()` - Mint vouchers using EIP712 signatures
- `burnForRedeem()` - Redeem and burn vouchers
- `setVoucherApproval()` - Admin approval for voucher creation
- `issueVoucherToUser()` - Direct voucher issuance by merchants

### MerchantRegistry
Manages merchant registration and verification.

**Key Functions:**
- `registerMerchant()` - Register new merchants (admin only)
- `updateMerchantStatus()` - Activate/deactivate merchants
- `isMerchant()` - Check if address is an active merchant

## 🔄 Voucher Lifecycle

1. **Merchant Registration** - Merchants submit registration requests through the platform
2. **Admin Approval** - Admins review and approve/reject merchant applications
3. **Voucher Creation** - Approved merchants create vouchers with EIP712 signatures
4. **Voucher Approval** - Admins approve vouchers before users can mint them
5. **Voucher Distribution** - Users mint approved vouchers; merchants may also issue them directly to users.
6. **Voucher Usage** - Users approach merchants to use their vouchers
7. **Voucher Redemption** - Users redeem vouchers, which burns the tokens permanently

## 🎯 User Roles

### 👤 Regular Users
- Browse marketplace
- Purchase vouchers
- Redeem vouchers
- View transaction history

### 🏪 Merchants
- Create voucher listings
- Manage voucher inventory
- Track sales and redemptions
- Update voucher metadata

### 👨‍💼 Admins
- Approve/reject merchant applications
- Approve/reject voucher listings
- Monitor platform activity
- Manage system settings

## 🔧 API Endpoints

### Voucher Routes
```
GET    /api/vouchers              # Get all vouchers
POST   /api/vouchers              # Create new voucher
GET    /api/vouchers/:id          # Get voucher by ID
PUT    /api/vouchers/:id/approve  # Approve voucher (admin only)
PUT    /api/vouchers/:id/reject   # Reject voucher (admin only)
PUT    /api/vouchers/:id/redeem   # Redeem voucher
PUT    /api/vouchers/:id/minted   # Update minted count
```

### Merchant Request Routes
```
POST   /api/merchant-requests     # Submit merchant application
GET    /api/merchant-requests/me  # Get my merchant request
GET    /api/merchant-requests     # Get all requests (admin only)
PUT    /api/merchant-requests/:id/approve # Approve merchant (admin only)
PUT    /api/merchant-requests/:id/reject  # Reject merchant (admin only)
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
forge test -vv
```

## 🚀 Deployment

### Backend (Production)
```bash
cd backend
npm start
```

### Frontend (Production)
```bash
cd frontend
npm run build
npm run preview
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

- 📧 Email: chiraggoyal3637@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/veyrix-Tr/VoucherHub/issues)
- 🐦 Twitter: [@veyrix_Tr](https://twitter.com/veyrix_Tr)


## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- The Ethereum community for Web3 standards
- React and Node.js communities for excellent frameworks

---

<div align="center">

**Made with ❤️ by the veyrix-Tr [Chirag Goyal]**

</div>
