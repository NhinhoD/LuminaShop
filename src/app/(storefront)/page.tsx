import { makeProductRepository } from "@/infrastructure/supabase/container";
import HomePageClient from "@/presentation/components/home/HomePageClient";

export default async function HomePage() {
  const productRepository = await makeProductRepository();
  const { products: featuredProducts } = await productRepository.findAll({ limit: 4 });

  return (
    <main className="flex flex-col min-h-screen">
      <HomePageClient featuredProducts={featuredProducts} />
    </main>
  );
}
