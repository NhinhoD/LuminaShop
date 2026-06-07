import { createClient } from "@/infrastructure/supabase/server";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarClient from "./NavbarClient";
import { getDictionary } from "@/i18n/getDictionary";
import { makeLanguageRepository } from "@/infrastructure/supabase/container";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const repo = await makeLanguageRepository();
  const dict = await getDictionary(repo);

  const navDict = (dict?.nav as Record<string, string>) || {};
  const navLinks = [
    { label: navDict.home || "Home", href: ROUTES.HOME },
    { label: navDict.templates || "Templates", href: ROUTES.SHOP },
    { label: navDict.portfolio || "Portfolio", href: "#portfolio" },
    { label: navDict.contact || "Contact", href: "#contact" },
  ] as const;

  return (
    <NavbarClient user={user} brandName={BRAND_NAME} navLinks={navLinks} dict={dict as unknown as Record<string, Record<string, string>>} />
  );
}
