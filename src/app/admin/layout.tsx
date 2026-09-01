import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
// Justification: Next.js App Router Server Components require direct cookie access for session validation.
// We alias createClient to createServerSupabaseClient to make the infrastructure coupling explicit.
import { createClient as createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { ROLES, ROUTES } from "@/presentation/constants";
import { NavLink } from "@/presentation/components/common/NavLink";
import { LanguageSwitcher } from "@/presentation/components/common/LanguageSwitcher";
import { Search, Bell, HelpCircle, User } from "lucide-react";

export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactNode> {
  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get("NEXT_LOCALE")?.value || "en") as "vi" | "en";

  // Layer 2: Server-side admin guard (defense-in-depth)
  const supabase = await createServerSupabaseClient();
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
    notFound();
  }

  return (
    <div className="h-screen overflow-hidden flex w-full">
      {/* SideNavBar Component */}
      <nav className="h-screen w-64 fixed left-0 top-0 border-r border-slate-200 shadow-none bg-slate-50 font-manrope text-sm font-medium z-50">
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 px-4 flex items-center gap-3">
            <Image src="/LogoKhoUI.png" alt="KhoUI Logo" width={100} height={40} priority className="h-10 w-auto object-contain" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight font-playfair">Admin Panel</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">E-commerce Suite</p>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5 flex-grow">
            <NavLink href="/admin" icon="dashboard">Dashboard</NavLink>
            <NavLink href="/admin/products" icon="inventory_2">Products</NavLink>
            <NavLink href="/admin/categories" icon="category">Categories</NavLink>
            <NavLink href="/admin/orders" icon="shopping_cart">Orders</NavLink>
            <NavLink href="/admin/customers" icon="group">Customers</NavLink>
            <NavLink href="/admin/languages" icon="language">Languages</NavLink>
            <NavLink href="/admin/translations" icon="translate">Translations</NavLink>
            <NavLink href="/admin/settings" icon="settings">Settings</NavLink>
          </ul>
        </div>
      </nav>

      {/* TopAppBar Component */}
      <header className="fixed top-0 right-0 left-64 h-16 border-b z-40 border-slate-200 shadow-sm bg-white/90 backdrop-blur-md font-manrope text-base text-slate-900">
        <div className="flex justify-between items-center px-8 w-full max-w-full h-full">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-md flex items-center">
              <Search size={16} className="absolute left-3.5 text-slate-400" />
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 text-slate-900" placeholder="Search across store..." type="text" />
            </div>
          </div>
          <div className="hidden text-xl font-bold text-slate-900 tracking-tight font-playfair">Admin Console</div>
          <div className="flex items-center gap-4">
            <div className="mr-2">
              <LanguageSwitcher initialLocale={initialLocale} />
            </div>
            <button className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Notifications">
              <Bell size={18} />
            </button>
            <button className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Help">
              <HelpCircle size={18} />
            </button>
            <button className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Account">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 mt-16 flex-1 overflow-y-auto bg-[#fcfbf9] p-8 w-[calc(100%-16rem)]">
        {children}
      </main>
    </div>
  );
}
