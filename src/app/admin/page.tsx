import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-container-max mx-auto space-y-md">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-h1 text-on-surface">Overview</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-inverse-surface transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Card (Primary Accent) */}
        <div className="col-span-12 lg:col-span-5 bg-primary text-on-primary rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[200px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-wider">Total Revenue</span>
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div className="font-display text-display mb-1">$124,563.00</div>
            <div className="font-body-sm text-body-sm text-tertiary-fixed-dim flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span>
              14.5% vs last month
            </div>
          </div>
          <div className="relative z-10 mt-6 h-16 w-full flex items-end gap-1 opacity-80">
            {/* Pseudo Sparkline Bars */}
            <div className="w-1/12 bg-primary-fixed h-1/4 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-2/4 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-1/3 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-3/4 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-2/3 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-4/5 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-1/2 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-5/6 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-3/4 rounded-t-sm"></div>
            <div className="w-1/12 bg-primary-fixed h-full rounded-t-sm bg-tertiary-fixed"></div>
          </div>
        </div>
        {/* Orders & Customers Column */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">local_shipping</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">Orders</span>
            </div>
            <div className="font-h1 text-h1 text-on-surface mb-1">1,432</div>
            <div className="font-body-sm text-body-sm text-on-tertiary-container flex items-center gap-1">
              +5.2% this week
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">person_add</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">New Customers</span>
            </div>
            <div className="font-h1 text-h1 text-on-surface mb-1">284</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              Steady growth
            </div>
          </div>
        </div>
        {/* Quick Actions Panel */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-6 shadow-sm">
          <h3 className="font-h3 text-h3 text-on-surface mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors group">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">add_box</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center">Add Product</span>
            </button>
            <button className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors group">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center">Create Promo</span>
            </button>
            <button className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors group">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center">Support Inbox</span>
            </button>
            <button className="bg-surface-container-lowest border border-outline-variant p-4 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors group">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center">Store Settings</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm mt-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h2 className="font-h3 text-h3 text-on-surface">Recent Orders</h2>
          <Link className="font-label-md text-label-md text-secondary hover:text-on-secondary-fixed-variant transition-colors flex items-center gap-1" href="/admin/orders">
            View All <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-4 px-6 font-body-sm text-body-sm font-medium text-on-surface">#ORD-0921</td>
                <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-sm">EH</div>
                  Eleanor Higgins
                </td>
                <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant">Oct 24, 2023</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-fixed-dim text-on-tertiary-fixed-variant">Completed</span>
                </td>
                <td className="py-4 px-6 font-body-md text-body-md font-semibold text-on-surface text-right">$324.50</td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="py-4 px-6 font-body-sm text-body-sm font-medium text-on-surface">#ORD-0920</td>
                <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm">MW</div>
                  Marcus Webb
                </td>
                <td className="py-4 px-6 font-body-sm text-body-sm text-on-surface-variant">Oct 24, 2023</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant border border-outline-variant">Processing</span>
                </td>
                <td className="py-4 px-6 font-body-md text-body-md font-semibold text-on-surface text-right">$89.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
