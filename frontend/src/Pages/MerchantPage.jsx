import React, { useEffect, useState } from "react";
import { useWallet } from "../Context/WalletContext.jsx";
import addresses from "../contracts/addresses.js";
import MerchantVoucherForm from "../Components/merchant/MerchantVoucherForm.jsx";

export default function MerchantPage({ merchantAddress }) {
    const { signer, provider, account } = useWallet();
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chainId, setChainId] = useState(null);

    useEffect(() => {
        async function getNetwork() {
            if (provider) {
                const network = await provider.getNetwork();
                setChainId(network.chainId);
            }
        }
        getNetwork();
    }, [provider]);

    useEffect(() => {
        async function fetchVouchers() {
            try {
                setLoading(true);
                const res = await fetch(`/api/vouchers?merchant=${account}`);
                const data = await res.json();
                setVouchers(data);
            } catch (err) {
                console.error("Error fetching vouchers:", err);
            } finally {
                setLoading(false);
            }
        }
        if (account) fetchVouchers();
    }, [account]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">
                Merchant Dashboard ({account?.slice(0, 6)}...{account?.slice(-4)})
            </h1>

            <div className="mb-8">
                <h2 className="text-xl font-medium mb-2">Issue New Voucher</h2>
                <MerchantVoucherForm signer={signer} contractAddress={addresses[chainId]?.voucherERC1155} />
            </div>

            {/* Voucher List */}
            <h2 className="text-xl font-medium mb-2">My Vouchers</h2>
            {loading ? (
                <p>Loading vouchers...</p>
            ) : vouchers.length === 0 ? (
                <p>No vouchers issued yet.</p>
            ) : (
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-2 py-1">Voucher ID</th>
                            <th className="border px-2 py-1">Metadata CID</th>
                            <th className="border px-2 py-1">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map((v, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">{v.voucherId}</td>
                                <td className="border px-2 py-1">
                                    <a
                                        href={`https://ipfs.io/ipfs/${v.metadataCid}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {v.metadataCid.slice(0, 10)}...
                                    </a>
                                </td>
                                <td className="border px-2 py-1">{v.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
