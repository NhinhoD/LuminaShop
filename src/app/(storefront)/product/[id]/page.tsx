import { notFound } from "next/navigation";
import { makeProductRepository, makeSupabaseClient } from "@/infrastructure/supabase/container";
import { BreadcrumbSetter } from "@/presentation/components/common/BreadcrumbSetter";
import { ROUTES } from "@/presentation/constants";
import ProductSelection from "@/presentation/components/product/ProductSelection";
import ProductMediaGallery from "@/presentation/components/product/ProductMediaGallery";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productRepository = await makeProductRepository();
  const product = await productRepository.findById(id);

  if (!product) {
    notFound();
  }

  const supabase = await makeSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  let hasPurchased = false;

  if (user) {
    const { data: purchasedItems } = await supabase
      .from('order_items')
      .select('order_id, orders!inner(user_id, payment_status)')
      .eq('product_id', product.id)
      .eq('orders.user_id', user.id)
      .eq('orders.payment_status', 'paid')
      .limit(1);
    
    if (purchasedItems && purchasedItems.length > 0) {
      hasPurchased = true;
    }
  }

  return (
    <main className="flex-grow bg-white py-12">
      <BreadcrumbSetter
        currentLabel={product.title}
        parentLabels={{ [ROUTES.SHOP]: "Menu" }}
      />

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Media Gallery & Interactive Sandbox */}
          <div className="lg:col-span-7">
            <ProductMediaGallery
              productId={product.id}
              title={product.title}
              imageUrl={product.imageUrl}
              demoUrl={product.demoUrl}
            />
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 pt-2">
            <div className="mb-8">
              <p className="text-[0.7rem] font-semibold text-secondary uppercase tracking-wider mb-3">
                Gourmet Selection
              </p>
              <h1 className="text-4xl font-black text-dark mb-4 leading-tight font-playfair">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 text-secondary text-sm">
                <span>⭐ 4.9</span>
                <span className="text-[#bbb]">(128 reviews)</span>
                <span className="w-px h-4 bg-[#ddd]" />
                <span className="text-green text-[0.75rem] font-semibold">🕐 12 min prep</span>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-[#f0f0f0]">
              <p className="text-[#777] leading-relaxed text-sm">
                {product.description ||
                  "Meticulously crafted with premium ingredients, this dish represents our commitment to quality and culinary excellence. Every bite is an adventure worth savoring."}
              </p>
            </div>

            <ProductSelection product={product} hasPurchased={hasPurchased} />

            {/* Extra Info Accordions */}
            <div className="mt-12 space-y-0">
              {[
                { title: "Chef's Notes", emoji: "👨‍🍳" },
                { title: "Ingredients & Allergens", emoji: "🌿" },
                { title: "Delivery & Packaging", emoji: "📦" },
              ].map((item) => (
                <button
                  key={item.title}
                  className="w-full flex items-center justify-between py-5 border-t border-[#f0f0f0] group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-xs font-bold text-dark uppercase tracking-wider font-poppins">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[#ccc] group-hover:text-primary transition-colors text-lg font-bold">
                    +
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
