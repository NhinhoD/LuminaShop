import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = { title: "Giỏ hàng | KhoUI" };

/**
 * Cart route shell that keeps page metadata on the server.
 */
export default function CartPage() {
  return <CartClient />;
}
