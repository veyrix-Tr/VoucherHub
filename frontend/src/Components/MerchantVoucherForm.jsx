import React, { useState } from "react";
import { ethers } from "ethers";
import { uploadMetadata } from "../utils/ipfs.js";
import buildVoucherTypedData from "../utils/eip712.js";

/**
Props:
  - signer: ethers Signer (from WalletContext)
  - contractAddress: address of VoucherERC1155 (verifyingContract)
*/
export default function MerchantVoucherForm({ signer, contractAddress }) {
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

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!signer) {
            alert("Connect your wallet first.");
            return;
        }
        setLoading(true);
        try {
            const merchantAddress = await signer.getAddress();
            const metadata = {
                name: form.title,
                description: form.description,
                properties: {
                    maxMint: Number(form.maxMint),
                    price: form.price,
                    nonce: form.nonce,
                },
                createdBy: merchantAddress,
                createdAt: new Date().toISOString(),
            };
            const metadataCID = await uploadMetadata(metadata, form.image);

            const metadataString = JSON.stringify(metadata);
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataString));

            const uidHex = ethers.keccak256(ethers.toUtf8Bytes(`${merchantAddress}:${form.nonce}`));
            const voucherId = BigInt(uidHex);

            const price = BigInt(ethers.parseUnits(String(form.price || "0"), 18));

            const voucherForSigning = {
                voucherId: voucherId,
                merchantAddress: merchantAddress,
                maxMint: BigInt(Number(form.maxMint)),
                expiry: BigInt(Math.floor(new Date(form.expiry).getTime() / 1000)),
                metadataHash: metadataHash,
                metadataCID: metadataCID,
                price: price,
                nonce: BigInt(Number(form.nonce || 1))
            };

            const network = await signer.provider.getNetwork();
            const CHAIN_ID = network.chainId;

            const domain = {
                name: "VoucherERC1155",
                version: "1",
                chainId: CHAIN_ID,
                verifyingContract: contractAddress,
            };

            const typed = buildVoucherTypedData(domain, voucherForSigning);
            const signature = await signer._signTypedData(typed.domain, typed.types, typed.message);

            console.log("Voucher:", voucherForSigning);
            console.log("Signature:", signature);

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