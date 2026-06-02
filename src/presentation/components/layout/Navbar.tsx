import { createClient } from "@/infrastructure/supabase/server";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarClient from "./NavbarClient";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navLinks = [
    { label: "Home", href: ROUTES.HOME },
    { label: "Menu", href: ROUTES.SHOP },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ] as const;

  return (
    <NavbarClient user={user} brandName={BRAND_NAME} navLinks={navLinks} />
  );
}
