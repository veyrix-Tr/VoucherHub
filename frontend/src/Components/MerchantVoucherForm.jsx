import React, { useState } from "react";
import { ethers, utils, BigNumber } from "ethers";
import { uploadMetadata } from "../utils/ipfs.js";
import { buildVoucherTypedData } from "../utils/eip712.js";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

/**
Props:
  - signer: ethers Signer (from WalletContext)
  - contractAddress: address of VoucherERC1155 (from addresses.js to use in domain for signature)

This component:
  1) collects voucher inputs
  2) uploads metadata to IPFS (nft.storage) and get metadataCID
  3) computes metadataHash
  4) constructs VoucherData matching Solidity struct and define domain
  5) use buildVoucherTypedData to build fully structured typed data
  5) asks merchant wallet to sign EIP-712 typed data from domain, tyoes and voucherData
  6) logs (voucher, signature) — ready to send to backend

*/
export default function MerchantVoucherForm({ signer, contractAddress }) {

    //the fields form has
    const [form, setForm] = useState({
        title: "",
        description: "",
        maxMint: "1",
        expiry: "",
        price: "0",
        image: null,
        nonce: "",
    });
    const [loading, setLoading] = useState(false);

    // give a upcoming date from now to use in expiry
    const getUpcomingDate = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0, 16);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!signer) {
            alert("Connect your wallet first.");
            return;

        } else if (new Date(form.expiry).getTime() <= Date.now()) {
            alert("Expiry must be in the future.");
            return;
        }
        setLoading(true);
        try {
            const merchant = await signer.getAddress();
            // const merchant = ethers.getAddress(merchantAddress);
            // metadata from the form filled by merchant
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

            // Compute a unique voucherId (utils.keccak256(merchant:nonce) -> uint256)
            const uidHex = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${merchant}:${form.nonce}`));
            const voucherId = BigNumber.from(uidHex);

            const expiry = BigNumber.from(Math.floor(new Date(form.expiry).getTime() / 1000))
            const price = BigNumber.from(ethers.utils.parseUnits(String(form.price || "0"), 18));

            const voucherData = {
                voucherId: voucherId.toString(),
                merchant,
                maxMint: BigNumber.from(form.maxMint).toString(),
                expiry: expiry.toString(),
                metadataHash,
                metadataCID,
                price: price.toString(),
                nonce: BigNumber.from(form.nonce || 1).toString()
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

            const resps = await axios.post(`${backendUrl}/api/vouchers`, {
                voucher: voucherData,
                signature,
                chainId: CHAIN_ID,
            });
            console.log("Backend response:", resps.data);


        } catch (err) {
            console.error("Error creating voucher:", err);
            alert("Error: " + err.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg flex flex-col gap-3">
            {/* Title */}
            <input
                type="text"
                name="title"
                placeholder="Voucher Title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
            />

            {/* Description */}
            <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
            />

            {/* Max Mint */}
            <input
                type="number"
                name="maxMint"
                placeholder="Max supply (maxMint)"
                value={form.maxMint}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
            />

            {/* Expiry (datetime-local gives good UX) */}
            <label className="text-sm text-gray-600">Expiry (date & time)</label>
            <input
                type="datetime-local"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                required
                min={getUpcomingDate(3)}
                className="w-full border px-3 py-2 rounded"
            />

            {/* Price in ETH (human-friendly). Will be converted to wei */}
            <input
                type="number"
                step="any"
                name="price"
                placeholder="Price (in ETH, optional)"
                value={form.price}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
            />

            {/* Nonce */}
            <input
                type="number"
                name="nonce"
                placeholder="Nonce (unique per merchant)"
                value={form.nonce}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded"
            />

            {/* Image */}
            <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="w-full"
            />

            <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded">
                {loading ? "Creating..." : "Create & Sign Voucher"}
            </button>
        </form>
    )
};