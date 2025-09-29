import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../Context/WalletContext.jsx";
import { useRole } from "../Context/RoleContext.jsx";
import { fetchVouchersByStatus } from "../utils/fetchVouchers.js";
import VoucherCard from "../Components/common/VoucherCard.jsx";
import { toast } from "react-hot-toast";
import { MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function Marketplace() {
  const { account } = useWallet();
  const { role } = useRole();

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    load();
  }, [account]);

  const load = () => {
    try {
      setError(null);
      fetchVouchersByStatus("approved", setVouchers, setLoading);
    } catch (err) {
      setError("Failed to load vouchers. Please try again.");
    }
  };

  const onRefresh = async () => {
    load();
    toast.success("Marketplace updated", {
      icon: "🔄",
      duration: 2000,
    });
  };

  const clearSearch = () => setQuery("");

  const filteredVouchers = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    let results = vouchers.slice();

    if (searchTerm) {
      results = results.filter((voucher) => {
        const name = voucher.metadata?.name || "";
        const description = voucher.metadata?.description || "";
        const voucherId = String(voucher.voucherId || "");
        return (
          name.toLowerCase().includes(searchTerm) ||
          description.toLowerCase().includes(searchTerm) ||
          voucherId.includes(searchTerm) ||
          voucher.merchantName?.toLowerCase().includes(searchTerm)
        );
      });
    }

    switch (sort) {
      case "price-asc":
        results.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price-desc":
        results.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "name-asc":
        results.sort((a, b) =>
          (a.metadata?.name || "").localeCompare(b.metadata?.name || "")
        );
        break;
      default:
        results.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }

    return results;
  }, [vouchers, query, sort]);

  const StatsBadge = () => (
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        {vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""} available
      </span>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 
      dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <div className="max-w-9xl mx-auto px-6 lg:px-15 pt-12 pb-32">
        <div className="flex items-center gap-2 mb-8">
          <Link to={`/${role}`} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors group" >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r 
              from-blue-600 100 via-pink-400 to-pink-800 bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
              Discover verified vouchers from trusted merchants — securely signed and validated on-chain.
            </p>
            <StatsBadge />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 min-w-[400px]">
              <MagnifyingGlassIcon className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-slate-400 z-1" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vouchers..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 
                  bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white 
                  focus:ring-2 focus:ring-purple-500 shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>

              <button onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-md disabled:opacity-50 transition-all"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          {error ? (
            <div className="rounded-2xl p-8 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 shadow-xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Unable to Load Vouchers
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
              <button
                onClick={load}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
                >
                  <div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="rounded-2xl p-12 bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {query ? "No matching vouchers found" : "No vouchers available"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                {query
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Check back soon for new vouchers from our trusted merchants."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {query && (
                  <button
                    onClick={clearSearch}
                    className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg 
                      text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  onClick={onRefresh}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-colors"
                >
                  Refresh Marketplace
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-700 dark:text-slate-200">
                  Showing{" "}
                  <span className="font-semibold text-yellow-500 dark:text-yellow-300">
                    {filteredVouchers.length}
                    </span>{" "}
                  of
                  {" "}<span className="font-semibold text-yellow-500 dark:text-yellow-300">
                    { vouchers.length}
                  </span>{" "}
                  vouchers
                </p>
                {query && (
                  <button onClick={clearSearch} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    Clear search
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredVouchers.map((voucher) => (
                  <div
                    key={voucher._id}
                    className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <VoucherCard voucher={voucher} role="marketplace" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
