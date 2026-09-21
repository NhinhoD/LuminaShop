import { makeGetCustomerCheckoutInfoUseCase } from "@/server/di/container";
import CheckoutClient, { CustomerCheckoutInfo } from "./CheckoutClient";

export const dynamic = "force-dynamic";

/**
 * Server component for the Storefront Checkout process.
 * Dynamically retrieves authenticated customer profile data to pre-fill delivery fields,
 * and renders CheckoutClient with clean architecture state management.
 *
 * @returns JSX Element for the checkout page.
 */
export default async function CheckoutPage() {
  let initialCustomerInfo: CustomerCheckoutInfo | null = null;

  try {
    const useCase = await makeGetCustomerCheckoutInfoUseCase();
    const result = await useCase.execute();
    if (result.success && result.data) {
      initialCustomerInfo = result.data;
    }
  } catch (error) {
    console.error("[CheckoutPage] Error retrieving initial customer info:", error);
  }

  return <CheckoutClient initialCustomerInfo={initialCustomerInfo} />;
}
