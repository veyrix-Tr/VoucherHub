import React, { useState } from "react";
import axios from "axios";
import { useWallet } from "../../Context/WalletContext.jsx";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function RequestMerchantForm() {
  const { account } = useWallet();
  const [businessName, setBusinessName] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!account) return alert("Connect wallet");
    if (!businessName || !details) return alert("Please fill name and details");
    setLoading(true);
    try {
      await axios.post(`${BACKEND}/api/merchant-requests`, {
        address: account,
        name: businessName,
        details
      });
      alert("Merchant request submitted. Admin will review it.");
      setBusinessName("");
      setDetails("");
    } catch (err) {
      console.error("merchant request error", err);
      alert(err?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">Request Merchant Role</h2>

      <label className="block text-sm text-gray-600 mb-1">Business / Shop name</label>
      <input
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
        placeholder="My Coffee Shop"
      />

      <label className="block text-sm text-gray-600 mb-1">Short details (what you sell / why)</label>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
        rows={4}
        placeholder="Tell admin why you should be a merchant..."
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </div>
  );
}
