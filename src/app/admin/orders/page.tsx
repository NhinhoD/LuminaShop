export default function AdminOrdersPage() {
  return (
    <div className="max-w-container-max mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-md">
        <h1 className="text-h1 text-on-background">Order Management</h1>
        <div className="flex gap-sm">
          <button className="h-12 px-md border border-outline rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button className="h-12 px-md bg-secondary text-on-secondary rounded-lg font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Order
          </button>
        </div>
      </div>
      
      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div className="font-display text-display text-on-surface">1,248</div>
          <div className="font-body-sm text-body-sm text-on-tertiary-container mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+12.5% from last month</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Pending Fulfillment</span>
            <div className="w-8 h-8 rounded-full bg-error-container/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[18px]">pending_actions</span>
            </div>
          </div>
          <div className="font-display text-display text-on-surface">42</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Needs attention today</span>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-fixed/30 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant">Revenue (YTD)</span>
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-fixed text-[18px]">payments</span>
              </div>
            </div>
            <div className="font-display text-display text-on-surface">$284.5k</div>
            <div className="font-body-sm text-body-sm text-on-tertiary-container mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+8.2% vs target</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-md border-b border-surface-variant flex flex-col md:flex-row items-center justify-between gap-md bg-surface-bright">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" placeholder="Search by ID or Name" type="text" />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select className="h-10 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer appearance-none">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
            <select className="h-10 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer appearance-none">
              <option value="">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
            </select>
            <button className="h-10 w-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-variant bg-surface-container-lowest">
                <th className="p-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Order ID</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Customer</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Date</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Total</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Status</th>
                <th className="p-md font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="p-md font-label-md text-label-md text-on-surface whitespace-nowrap">#ORD-9021</td>
                <td className="p-md whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden flex-shrink-0">
                      <img alt="Customer Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDZ7Bt3I2HBVxA67_uI5oZWKcguEoYt1MBnrQXBODvaULZROoNI4oPYsojQ6ibtcHwltVgwRprCl7IqYJRiOwW19tHVJFSP2TmzyZ6WStJ0imlhX9EHw2AWFVGS-dAivYNWaXtoe0JUoDm-0POqoPon0n_WqpckNJYRjm4FXgsxxK96BHzwaBnPR1Bu7DnCp3IPVWZdJ4m7UzWn3a7AsftEBL4upnBGXzdgZGibLErDmGQNAPc7sCala01evSrUwcguaBS50TjcYa9" />
                    </div>
                    <div>
                      <div className="font-label-md text-label-md text-on-surface">Sarah Jenkins</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">sarah.j@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-md font-body-sm text-body-sm text-on-surface whitespace-nowrap">Oct 24, 2023</td>
                <td className="p-md font-label-md text-label-md text-on-surface whitespace-nowrap">$429.00</td>
                <td className="p-md whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline mr-2"></span>
                    Pending
                  </span>
                </td>
                <td className="p-md text-right whitespace-nowrap">
                  <button className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="p-md font-label-md text-label-md text-on-surface whitespace-nowrap">#ORD-9020</td>
                <td className="p-md whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden flex-shrink-0">
                      <img alt="Customer Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBucKvEozhtNnTbOxiunE6RSZ8qGfYUMKUjGDXeikoZEgxR67hlQ_kZDInYtKZt-jC349wMDxa8q4FyWGKivOB4k6pcQdxL1p3lkewzBhKXqK76U-rjovQUBOkFwD0oixYxfzOgZP6aJHNtRI-PiE331xMGKe4jZ7_bTRZp99twEpdybmkc4hz5vl7YExiyUAvErrW3UqybrJ1Hfmdpvc80aLxTMBxDCi5gSVwBZvzrNd4_pciFNOmk_MXGBgyppFBfYqby9Sf1vEpE" />
                    </div>
                    <div>
                      <div className="font-label-md text-label-md text-on-surface">Michael Chen</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">m.chen@domain.co</div>
                    </div>
                  </div>
                </td>
                <td className="p-md font-body-sm text-body-sm text-on-surface whitespace-nowrap">Oct 24, 2023</td>
                <td className="p-md font-label-md text-label-md text-on-surface whitespace-nowrap">$1,250.50</td>
                <td className="p-md whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span>
                    Shipped
                  </span>
                </td>
                <td className="p-md text-right whitespace-nowrap">
                  <button className="p-2 text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-md border-t border-surface-variant flex items-center justify-between bg-surface-container-lowest">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 2 of 1,248 results</span>
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container-low transition-colors" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="h-8 w-8 flex items-center justify-center rounded bg-primary text-on-primary font-label-sm text-label-sm">1</button>
            <button className="h-8 w-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors font-label-sm text-label-sm">2</button>
            <span className="text-on-surface-variant mx-1">...</span>
            <button className="h-8 w-8 flex items-center justify-center rounded border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
