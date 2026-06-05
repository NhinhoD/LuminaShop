import { createClient } from "@/infrastructure/supabase/server";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarClient from "./NavbarClient";
import { getDictionary } from "@/i18n/getDictionary";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const dict = await getDictionary();

  const navLinks = [
    { label: dict?.nav?.home || "Home", href: ROUTES.HOME },
    { label: dict?.nav?.templates || "Templates", href: ROUTES.SHOP },
    { label: dict?.nav?.portfolio || "Portfolio", href: "#portfolio" },
    { label: dict?.nav?.contact || "Contact", href: "#contact" },
  ] as const;

  return (
    <NavbarClient user={user} brandName={BRAND_NAME} navLinks={navLinks} dict={dict} />
  );
}
