/**
 * Global Constants for KhoUI (Digital Template & Source Code Marketplace)
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
  MAX_WIDTH: "1400px",
  ACCENT_COLOR: "#0051d5",
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
  CONTAINER: "max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12",
  SECTION_SPACING: "py-16 md:py-24",
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
  FIRST_NAME: "Minh",
  LAST_NAME: "Tuan",
  EMAIL: "contact@khoui.com",
  PASSWORD: "••••••••",
} as const;
