import { makeAuthRepository, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarClient from "./NavbarClient";
import { getDictionary } from "@/i18n/getDictionary";

export async function Navbar() {
  const authRepo = await makeAuthRepository();
  const user = await authRepo.getCurrentUser();
  const repo = await makeLanguageRepository();
  const dict = await getDictionary(repo);

  const navDict = (dict?.nav as Record<string, string>) || {};
  const navLinks = [
    { label: navDict.home || "Trang chủ", href: ROUTES.HOME },
    { label: navDict.templates || "Kho Template", href: ROUTES.SHOP },
    { label: navDict.portfolio || "Bộ sưu tập", href: "/shop?category=portfolio" },
    { label: navDict.contact || "Hỗ trợ kỹ thuật", href: "mailto:contact@khoui.com" },
  ] as const;

  return (
    <NavbarClient user={user} brandName={BRAND_NAME} navLinks={navLinks} dict={dict as unknown as Record<string, Record<string, string>>} />
  );
}
