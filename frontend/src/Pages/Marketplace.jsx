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
      icon: '🔄',
      duration: 2000
    });
  };

  const clearSearch = () => setQuery("");

  // Memoize filtered & sorted vouchers to avoid unnecessary recalculations on re-render
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
        results.sort((a, b) => (a.metadata?.name || "").localeCompare(b.metadata?.name || ""));
        break;
      default:
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return results;
  }, [vouchers, query, sort]);

  const StatsBadge = () => (
    <div className="flex flex-wrap items-center gap-3 mt-3">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""} available
      </span>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Link to={`/${role}`} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-yellow-400">
                Marketplace
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                Discover verified vouchers from trusted merchants. Each voucher is securely signed and validated on the blockchain.
              </p>
              <StatsBadge />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search vouchers, merchants, or IDs..."
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {query && (
                  <button onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>

                <button onClick={onRefresh} disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl p-8 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 shadow-lg text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Unable to Load Vouchers
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
            <button onClick={load}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>

        ) : loading ? (
          // This shows 9 animated skeleton cards in a grid while data is loading, so the UI doesn’t feel empty
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mt-4" />
              </div>
            ))}
          </div>

        ) : filteredVouchers.length === 0 ? (
          <div className="rounded-2xl p-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-center">

            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
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
                <button onClick={clearSearch} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" >
                  Clear Search
                </button>
              )}
              <button onClick={onRefresh} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" >
                Refresh Marketplace
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredVouchers.length}</span> of
                <span className="font-semibold text-slate-900 dark:text-white"> {vouchers.length}</span> vouchers
              </p>
              {query && (
                <button onClick={clearSearch}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVouchers.map((voucher) => (
                <div key={voucher._id} className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl" >
                  <VoucherCard voucher={voucher} role="marketplace" />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-16" />
      </div>
    </main>
  );
}