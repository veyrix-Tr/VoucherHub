import React, { useState } from "react";
import { ethers, BigNumber } from "ethers";
import { uploadMetadata } from "../../utils/ipfs.js";
import { buildVoucherTypedData } from "../../utils/eip712.js";
import axios from "axios";
import { DocumentPlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function MerchantVoucherForm({ signer, contractAddress }) {
	const [form, setForm] = useState({
		title: "",
		description: "",
		maxMint: "100",
		expiry: "",
		price: "0",
		image: null,
		nonce: Date.now().toString(),
	});
	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState(null);

	const getUpcomingDate = (days) => {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return date.toISOString().slice(0, 16);
	};

	const handleChange = (e) => {
		const { name, value, files } = e.target;

		if (name === "image" && files && files[0]) {
			const file = files[0];
			setForm((prev) => ({ ...prev, [name]: file }));
			const reader = new FileReader();
			reader.onload = (e) => setImagePreview(e.target.result);
			reader.readAsDataURL(file);
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!signer) {
			toast.error("Please connect your wallet first");
			return;
		} else if (new Date(form.expiry).getTime() <= Date.now()) {
			toast.error("Expiry must be in the future");
			return;
		}

		setLoading(true);
		try {
			const merchant = await signer.getAddress();

			const metadata = {
				name: form.title,
				description: form.description,
				expiry: form.expiry,
				properties: {
					maxMint: Number(form.maxMint),
					price: form.price,
					nonce: form.nonce,
					createdBy: merchant,
					createdAt: new Date().toISOString(),
				},
			};

			const metadataCID = await uploadMetadata(metadata, form.image);
			const metadataString = JSON.stringify(metadata);
			const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(metadataString));

			const uidHex = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${merchant}:${form.nonce}`));
			const voucherId = BigNumber.from(uidHex);

			const expiry = BigNumber.from(Math.floor(new Date(form.expiry).getTime() / 1000));
			const price = BigNumber.from(ethers.utils.parseUnits(String(form.price || "0"), 18));

			const voucherData = {
				voucherId: voucherId.toString(),
				merchant,
				maxMint: BigNumber.from(form.maxMint).toString(),
				expiry: expiry.toString(),
				metadataHash,
				metadataCID,
				price: price.toString(),
				nonce: BigNumber.from(form.nonce || 1).toString(),
			};

			const network = await signer.provider.getNetwork();
			const CHAIN_ID = network.chainId;

			const domain = {
				name: "VoucherERC1155",
				version: "1",
				chainId: CHAIN_ID,
				verifyingContract: contractAddress,
			};
			const typed = buildVoucherTypedData(domain, voucherData);
			const signature = await signer._signTypedData(typed.domain, typed.types, typed.message);

			await axios.post(`${backendUrl}/api/vouchers`, {
				voucher: voucherData,
				signature,
				chainId: CHAIN_ID,
			});

			toast.success("Voucher created successfully!");

			setForm({
				title: "",
				description: "",
				maxMint: "100",
				expiry: "",
				price: "0",
				image: null,
				nonce: Date.now().toString(),
			});
			setImagePreview(null);
		} catch (err) {
			console.error("Error creating voucher:", err);
			toast.error(err.message || "Failed to create voucher");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Voucher Title *
						</label>
						<input
							type="text"
							name="title"
							placeholder="e.g., 20% Off Coffee Discount"
							value={form.title}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Description *
						</label>
						<textarea
							name="description"
							placeholder="Describe what this voucher offers..."
							value={form.description}
							onChange={handleChange}
							required
							rows={4}
							className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Max Supply *
						</label>
						<input
							type="number"
							name="maxMint"
							placeholder="Maximum number of vouchers"
							value={form.maxMint}
							onChange={handleChange}
							required
							min="1"
							className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
						/>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Expiry Date & Time *
						</label>
						<input
							type="datetime-local"
							name="expiry"
							value={form.expiry}
							onChange={handleChange}
							required
							min={getUpcomingDate(7)}
							className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all colorscheme-white"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Price (ETH)
						</label>
						<input
							type="number"
							step="any"
							name="price"
							placeholder="0.00"
							value={form.price}
							onChange={handleChange}
							min="0"
							className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Nonce *
						</label>
						<input
							type="number"
							name="nonce"
							placeholder="Unique identifier"
							value={form.nonce}
							onChange={handleChange}
							required
							className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
							Voucher Image
						</label>
						<div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center transition-all hover:border-purple-500">
							{imagePreview ? (
								<div className="space-y-2">
									<img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl mx-auto" />
									<button type="button" onClick={() => {
										setImagePreview(null);
										setForm((prev) => ({ ...prev, image: null }));
									}}
										className="text-sm text-red-600 hover:text-red-800 bg-red-300/10 px-3 py-0.5 rounded-md cursor-pointer"
									>
										Remove Image
									</button>
								</div>
							) : (
								<div className="space-y-2">
									<PhotoIcon className="w-8 h-8 text-slate-400 mx-auto" />
									<p className="text-sm text-slate-500">Click to upload an image</p>
									<input
										type="file"
										name="image"
										accept="image/*"
										onChange={handleChange}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<button type="submit" disabled={loading}
				className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl hover:from-emerald-600 hover:to-green-600 disabled:from-slate-400 disabled:to-slate-400 transition-all font-medium shadow-sm flex items-center justify-center gap-2"
			>
				<DocumentPlusIcon className="w-5 h-5" />
				{loading ? "Creating Voucher..." : "Create & Sign Voucher"}
			</button>
		</form>
	);
}
