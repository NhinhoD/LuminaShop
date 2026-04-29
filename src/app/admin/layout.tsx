import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { ROLES, ROUTES } from "@/presentation/constants";
import { NavLink } from "@/presentation/components/common/NavLink";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Layer 2: Server-side admin guard (defense-in-depth)
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // If not logged in, redirect to login instead of 404 to improve UX
  if (userError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Check role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // If not an admin, show 404 to hide admin existence (security by obscurity)
  if (profileError || !profile || profile.role !== ROLES.ADMIN) {
    console.warn(`Admin access denied for user ${user.id}:`, profileError || 'Not an admin');
    notFound();
  }

  return (
    <div className="h-screen overflow-hidden flex w-full">
      {/* SideNavBar Component */}
      <nav className="h-screen w-64 fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800 shadow-none bg-slate-50 dark:bg-slate-950 font-manrope text-sm font-medium z-50">
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 px-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0051d5] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Admin Panel</h2>
              <p className="text-slate-500 text-xs">E-commerce Suite</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2 flex-grow">
            <NavLink href="/admin" icon="dashboard">Dashboard</NavLink>
            <NavLink href="/admin/products" icon="inventory_2">Products</NavLink>
            <NavLink href="/admin/categories" icon="category">Categories</NavLink>
            <NavLink href="/admin/orders" icon="shopping_cart">Orders</NavLink>
            <NavLink href="/admin/customers" icon="group">Customers</NavLink>
            <NavLink href="/admin/settings" icon="settings">Settings</NavLink>
          </ul>
        </div>
      </nav>

      {/* TopAppBar Component */}
      <header className="fixed top-0 right-0 left-64 h-16 border-b z-40 border-slate-200 dark:border-slate-800 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md font-manrope text-base text-slate-900 dark:text-slate-50 focus-within:ring-2 focus-within:ring-slate-400">
        <div className="flex justify-between items-center px-8 w-full max-w-full h-full">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-md flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-slate-400">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-0 text-slate-900 dark:text-slate-50" placeholder="Search across store..." type="text" />
            </div>
          </div>
          <div className="hidden text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Admin Console</div>
          <div className="flex items-center gap-6">
            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 mt-16 flex-1 overflow-y-auto bg-white p-8 w-[calc(100%-16rem)]">
        {children}
      </main>
    </div>
  );
}
