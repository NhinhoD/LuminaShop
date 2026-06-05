/**
 * Global Constants for LuminaShop (Sarab F&B Design)
 * Used to avoid hardcoding strings and values throughout the application.
 */

export const BRAND_NAME = "KhoUI";

export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  PRODUCT: "/product",
  CART: "/cart",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
  NOT_FOUND: "/_not-found",
  ADMIN: "/admin",
  CHECKOUT: "/checkout",
  ORDERS: "/profile/orders",
  WISHLIST: "/profile/wishlist",
  ADDRESSES: "/profile/addresses",
} as const;

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const UI_CONFIG = {
  MAX_WIDTH: "1440px",
  ACCENT_COLOR: "#e8281a",
  NAVBAR_HEIGHT: "0px",
} as const;

export const CATEGORIES = {
  LANDING: "Landing Page",
  ECOMMERCE: "E-Commerce",
  DASHBOARD: "Admin Dashboard",
  PORTFOLIO: "Portfolio",
  CORPORATE: "Corporate",
  BLOG: "Blog",
} as const;

export const LAYOUT_CLASSES = {
  CONTAINER: `max-w-[${UI_CONFIG.MAX_WIDTH}] mx-auto px-8 md:px-12`,
  SECTION_SPACING: "py-10 mb-20",
} as const;

export const UI_LABELS = {
  SHOP_THE_COLLECTION: "Explore Catalog",
  CREATE_ACCOUNT: "Create Account",
  LOG_IN: "Log In",
  LOG_OUT: "Log Out",
  SAVE_CHANGES: "Save Changes",
  VIEW_ALL: "View Full Catalog",
  RECENT_ORDERS: "Recent Orders",
  PROFILE_INFO: "Profile Information",
  ORDER_HISTORY: "Order History",
  WISHLIST: "Wishlist",
  ADDRESSES: "Addresses",
} as const;

export const PLACEHOLDERS = {
  FIRST_NAME: "Jane",
  LAST_NAME: "Doe",
  EMAIL: "jane.doe@example.com",
  PASSWORD: "••••••••",
} as const;
