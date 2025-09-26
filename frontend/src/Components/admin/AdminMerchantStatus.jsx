import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../Context/WalletContext.jsx";
import { toast } from "react-hot-toast";
import MerchantRegistryABI from "../../../../backend/src/abi/MerchantRegistry.json";
import CONTRACT_ADDRESSES from "../../contracts/addresses.js";
import { fetchMerchantRequests } from "../../utils/utilsMerchantRequests.js";
import { ArrowPathIcon, UserIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminMerchantStatus() {
  const { signer, account } = useWallet();
  const [merchants, setMerchants] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";
  const MERCHANT_REGISTRY_ADDRESS = CONTRACT_ADDRESSES[CHAIN_ID]?.merchantRegistry;

  const contract = signer
    ? new ethers.Contract(MERCHANT_REGISTRY_ADDRESS, MerchantRegistryABI, signer)
    : null;

  const fetchMerchants = async () => {
    if (contract) {
      await fetchMerchantRequests("approved", setRequests, setLoading);
      const merchantData = await Promise.all(
        requests.map(async (request) => {
          const active = await contract.isMerchant(request.address);
          return { ...request , active: active };
        })
      );
      setMerchants(merchantData);
    } else return
  }

  const toggleStatus = async (address, currentStatus) => {
    try {
      if (!contract) return;
      const newStatus = !currentStatus;
      const tx = await contract.updateMerchantStatus(address, newStatus);
      toast.promise(
        tx.wait(),
        {
          loading: `Updating merchant status...`,
          success: `Merchant ${newStatus ? 'activated' : 'deactivated'} successfully! with id: ${tx}`,
        }
      );
      await tx.wait();
      fetchMerchants();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Transaction failed");
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [contract, account]);

  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-white mb-4">Active Merchants</h2>

      {loading ? (
        <p className="text-gray-400">Loading merchants...</p>
      ) : merchants.length === 0 ? (
        <p className="text-gray-400">No merchants found.</p>
      ) : (
        <table className="min-w-full text-gray-300">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="py-2">Address</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((merchant, idx) => (
              <tr key={idx} className="border-b border-gray-800">
                <td className="py-3 font-mono">{merchant.address}</td>
                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${merchant.active
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                      }`}
                  >
                    {merchant.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => toggleStatus(merchant.address, merchant.active)}
                    className={`${merchant.active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                      } text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors`}
                  >
                    {merchant.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
