import { createClient } from "@/infrastructure/supabase/server";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarClient from "./NavbarClient";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navLinks = [
    { label: "SHOP ALL", href: ROUTES.SHOP },
    { label: "NEW ARRIVALS", href: `${ROUTES.SHOP}?category=new` },
    { label: "COLLECTIONS", href: `${ROUTES.SHOP}?collection=all` },
    { label: "EDITORIAL", href: "#" },
    { label: "SUPPORT", href: "#" },
  ] as const;

  return (
    <NavbarClient user={user} brandName={BRAND_NAME} navLinks={navLinks} />
  );
}
