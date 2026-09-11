import { makeGetCustomerCheckoutInfoUseCase } from "@/infrastructure/supabase/container";
import CheckoutClient, { CustomerCheckoutInfo } from "./CheckoutClient";

export const dynamic = "force-dynamic";

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
