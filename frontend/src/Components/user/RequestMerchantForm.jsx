import React, { useState } from "react";
import axios from "axios";
import { useWallet } from "../../Context/WalletContext.jsx";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function RequestMerchantForm() {
  const { account } = useWallet();
  const [formData, setFormData] = useState({
    businessName: "",
    details: ""
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    } else if (!formData.businessName.trim() || !formData.details.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND}/api/merchant-requests`, {
        address: account,
        name: formData.businessName.trim(),
        details: formData.details.trim()
      });
      
      toast.success("Merchant request submitted successfully!");
      setFormData({ businessName: "", details: "" });
    } catch (err) {
      console.error("Merchant request error", err);
      toast.error(err?.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <BuildingStorefrontIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Become a Merchant</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Apply to start selling vouchers on our platform
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
            Business Name
          </label>
          <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your business or brand name"
            required
          />
        </div>

        <div>
          <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
            Business Details
          </label>
          <textarea name="details" value={formData.details} onChange={handleChange} rows={5}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Describe your business, what you plan to offer, and why you want to become a merchant..."
            required
          />
        </div>

        <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-400 transition-all font-medium shadow-sm">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Application...
            </span>
          ) : (
            "Submit Merchant Application"
          )}
        </button>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Your application will be reviewed by our admin team. 
            You'll receive a notification once your merchant status is approved. 
            This process usually takes 24-48 hours.
          </p>
        </div>
      </form>
    </div>
  );
}