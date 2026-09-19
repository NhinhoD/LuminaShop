import { makeGetCurrentUserUseCase, getAppDictionary } from "@/server/di/container";
import { ROUTES, BRAND_NAME } from "@/shared/constants";
import NavbarClient from "./NavbarClient";

export async function Navbar() {
  const getCurrentUserUseCase = await makeGetCurrentUserUseCase();
  const userResult = await getCurrentUserUseCase.execute();
  if (!userResult.success) {
    console.error("Navbar: Failed to retrieve current user:", userResult.error);
  }
  const user = userResult.success ? userResult.data : null;
  const authError = !userResult.success;
  const dict = await getAppDictionary();

  const navDict = (dict?.nav as Record<string, string>) || {};
  const navLinks = [
    { label: navDict.home || "Trang chủ", href: ROUTES.HOME },
    { label: navDict.templates || "Kho Template", href: ROUTES.SHOP },
    { label: navDict.portfolio || "Bộ sưu tập", href: "/shop?category=portfolio-agency" },
    { label: navDict.contact || "Hỗ trợ kỹ thuật", href: "mailto:contact@khoui.com" },
  ] as const;

  return (
    <NavbarClient 
      user={user} 
      authError={authError}
      brandName={BRAND_NAME} 
      navLinks={navLinks} 
      dict={dict as unknown as Record<string, Record<string, string>>} 
    />
  );
}
