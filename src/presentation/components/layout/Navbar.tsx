import { makeGetCurrentUserUseCase, getAppDictionary } from "@/di/container";
import { ROUTES, BRAND_NAME } from "@/presentation/constants";
import NavbarClient from "./NavbarClient";

export async function Navbar() {
  const getCurrentUserUseCase = await makeGetCurrentUserUseCase();
  const user = await getCurrentUserUseCase.execute();
  const dict = await getAppDictionary();

  const navDict = (dict?.nav as Record<string, string>) || {};
  const navLinks = [
    { label: navDict.home || "Trang chủ", href: ROUTES.HOME },
    { label: navDict.templates || "Kho Template", href: ROUTES.SHOP },
    { label: navDict.portfolio || "Bộ sưu tập", href: "/shop?category=portfolio-agency" },
    { label: navDict.contact || "Hỗ trợ kỹ thuật", href: "mailto:contact@khoui.com" },
  ] as const;

  return (
    <NavbarClient user={user} brandName={BRAND_NAME} navLinks={navLinks} dict={dict as unknown as Record<string, Record<string, string>>} />
  );
}
