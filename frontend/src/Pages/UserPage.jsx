import React, { useState } from "react";
import MyVouchers from "../Components/user/MyVouchers.jsx";
import RequestMerchantForm from "../Components/user/RequestMerchantForm.jsx";

export default function UserPage() {
  const [activeSection, setActiveSection] = useState("active");

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 
      dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors">

      <div className="max-w-9xl mx-auto px-6 lg:px-15 pt-12 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r 
            from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Manage your vouchers and account settings
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          <aside className="lg:col-span-1">
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm 
              rounded-2xl border border-slate-200 dark:border-slate-700 
              shadow-xl p-6 transition-all">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Voucher Categories
              </h3>
              <nav className="space-y-2">
                {[
                  { key: "active", label: "Active Vouchers", icon: "🟢" },
                  { key: "expired", label: "Expired Vouchers", icon: "🔴" },
                  { key: "redeemed", label: "Redeemed Vouchers", icon: "🟡" }
                ].map((item) => (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${activeSection === item.key
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-10">
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm 
              rounded-2xl border border-slate-200 dark:border-slate-700 
              shadow-xl p-8 transition-all">
              <MyVouchers activeSection={activeSection} />
            </div>

            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm 
              rounded-2xl border border-slate-200 dark:border-slate-700 
              shadow-xl p-8 transition-all">
              <RequestMerchantForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
