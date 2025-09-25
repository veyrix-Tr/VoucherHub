import React, { useEffect, useState, useMemo } from "react";
import { useWallet } from "../Context/WalletContext.jsx";
import addresses from "../contracts/addresses.js";
import MerchantVoucherForm from "../Components/merchant/MerchantVoucherForm.jsx";
import VoucherCard from "../Components/common/VoucherCard.jsx";
import { fetchVouchersByOwner } from "../utils/fetchVouchers.js";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function MerchantPage() {
	const { account, signer, provider } = useWallet();
	const [vouchers, setVouchers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("approved");

	const chainId = provider?._network?.chainId || parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);

	useEffect(() => {
		loadVouchers();
	}, [account]);

	const loadVouchers = async () => {
		if (account) {
		 await fetchVouchersByOwner(account, setVouchers, setLoading);
		} else {
			toast.error("Please connect your wallet first");
		}
	};

	const statusConfig = {
		approved: { label: "Approved", color: "green", icon: "✅" },
		pending: { label: "Pending", color: "yellow", icon: "⏳" },
		rejected: { label: "Rejected", color: "red", icon: "❌" },
		redeemed: { label: "Redeemed", color: "blue", icon: "🎫" },
	};

	const grouped = useMemo(() => {
		return vouchers.reduce((acc, v) => {
			acc[v.status] = [...(acc[v.status] || []), v];
			return acc;
		}, {});
	}, [vouchers]);

	const current = grouped[activeTab] || [];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
			<div className="max-w-8xl mx-auto px-4 sm:px-16 lg:px-13 py-8">
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
						Merchant Dashboard
					</h1>
					<p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
						Create and manage your vouchers
					</p>
				</div>

				<div className="grid lg:grid-cols-4 gap-15">
					<div className="lg:col-span-3 space-y-14">
						<div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
							<div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
								<div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
									<PlusIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Voucher</h2>
									<p className="text-slate-600 dark:text-slate-300">Issue a new voucher for your customers</p>
								</div>
							</div>
							<div className="p-6">
								<MerchantVoucherForm signer={signer} contractAddress={addresses[chainId]?.voucherERC1155} />
							</div>
						</div>

						<div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
							<div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Vouchers</h2>
									<p className="text-slate-600 dark:text-slate-300 mt-1">Manage your voucher collection and track their status</p>
								</div>
								<button	onClick={loadVouchers}	disabled={loading}
									className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
								>
									<ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
									Refresh
								</button>
							</div>

							<div className="px-6 pt-6 flex gap-2 overflow-x-auto">
								{Object.entries(statusConfig).map(([key, { label, color }]) => (
									<button key={key} onClick={() => setActiveTab(key)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === key
											? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
											: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
											}`}
									>
										<span className="font-medium">{label}</span>
										<span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-300`}>
											{(grouped[key] || []).length}
										</span>
									</button>
								))}
							</div>

							<div className="p-6">
								{loading ? (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
										{Array.from({ length: 6 }).map((_, i) => (
											<div key={i} className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-700 p-6">
												<div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-600 mb-4" />
												<div className="h-4 bg-slate-200 dark:bg-slate-600 rounded mb-3" />
												<div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-2/3" />
											</div>
										))}
									</div>
								) : current.length === 0 ? (
									<div className="text-center py-12">
										<div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl">
											{statusConfig[activeTab].icon}
										</div>
										<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No {activeTab} vouchers</h3>
										<p className="text-slate-600 dark:text-slate-300">
											{activeTab === "approved"
												? "Your approved vouchers will appear here"
												: activeTab === "pending"
													? "Vouchers waiting for admin approval"
													: activeTab === "rejected"
														? "Vouchers that were not approved"
														: "Vouchers redeemed by customers"}
										</p>
									</div>
								) : (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
										{current.map(v => (
											<VoucherCard key={v._id} voucher={v} role="merchant" />
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					<aside className="lg:col-span-1 pl-10">
						<div className="sticky top-24">
							<div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
								<h3 className="text-lg font-semibold text-slate-900 dark:text-white">Voucher Stats</h3>
								{Object.entries(statusConfig).map(([key, { label, color }]) => (
									<div key={key} className={`flex justify-between items-center p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg`}>
										<span className={`font-medium text-${color}-700 dark:text-${color}-300`}>{label}</span>
										<span className={`text-lg font-bold text-${color}-600 dark:text-${color}-400`}>
											{(grouped[key] || []).length}
										</span>
									</div>
								))}
								<div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
									<span className="text-slate-700 dark:text-slate-300 font-medium">Total</span>
									<span className="text-lg font-bold text-slate-900 dark:text-white">{vouchers.length}</span>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
