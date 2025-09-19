import React, { useState } from "react";
import axios from "axios";
import { useWallet } from "../../Context/WalletContext.jsx";

export default function RequestMerchantForm() {
  const { account } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleRequest(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.reason.trim()) {
      return alert("Please provide both name and reason.");
    }

    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/merchants/request`, {
        user: account,
        ...formData,
      });
      alert("Merchant request submitted!");
      setFormData({ name: "", reason: "" });
    } catch (err) {
      console.error("Request error:", err);
      alert(err?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleRequest}
      className="bg-white shadow rounded-lg p-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Request Merchant Role
      </h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name"
        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <textarea
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        placeholder="Why do you want to become a merchant?"
        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
