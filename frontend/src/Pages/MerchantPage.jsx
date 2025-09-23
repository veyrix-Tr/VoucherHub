import React, { useEffect, useState } from "react";
import { useWallet } from "../Context/WalletContext.jsx";
import addresses from "../contracts/addresses.js";
import MerchantVoucherForm from "../Components/merchant/MerchantVoucherForm.jsx";
import { fetchVouchersByOwner } from "../utils/fetchVouchers.js";
import VoucherCard from "../Components/common/VoucherCard.jsx";
import Navbar from "../Components/common/Navbar.jsx";
import Footer from "../Components/common/Footer.jsx";


export default function MerchantPage() {
	const { account, signer } = useWallet();
	const [vouchers, setVouchers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [chainId, setChainId] = useState(null);

	useEffect(() => {
		async function getNetwork() {
			if (signer) {
				const network = await signer.provider.getNetwork();
				setChainId(network.chainId);
			}
		}
		getNetwork();
	}, [signer]);

	useEffect(() => {
		if (account) {
			fetchVouchersByOwner(account, setVouchers, setLoading);
		}
	}, [account]);

	const approvedVouchers = vouchers.filter(v => v.status === "approved");
	const pendingVouchers = vouchers.filter(v => v.status === "pending");
	const rejectedVouchers = vouchers.filter(v => v.status === "rejected");
	const redeemedVouchers = vouchers.filter(v => v.status === "redeemed");


	const renderSection = (title, items) => (
		loading ? (
			<p>Loading {title} vouchers...</p>
		) : (
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">{`${title} (${items.length})`}</h2>
				{items.length === 0 ? (
					<p className="text-gray-500">No vouchers</p>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{items.map(v => (
							<VoucherCard key={v._id} voucher={v} role="merchant" />
						))}
					</div>
				)}
			</div>
		)
	);

	return (
		<>
			<div className="p-6 bg-gray-50 min-h-screen">

				<div className="mb-8">
					<h2 className="text-xl font-medium mb-2">Issue New Voucher</h2>
					<MerchantVoucherForm signer={signer} contractAddress={addresses[chainId]?.voucherERC1155} />
				</div>

				{renderSection("Approved", approvedVouchers)}
				{renderSection("Pending", pendingVouchers)}
				{renderSection("Rejected", rejectedVouchers)}
				{renderSection("Redeemed", redeemedVouchers)}
			</div>
		</>
	);
}
