import { notFound } from "next/navigation";
import Link from "next/link";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import { BreadcrumbSetter } from "@/presentation/components/common/BreadcrumbSetter";
import { ROUTES } from "@/presentation/constants";
import AddToCartButton from "@/presentation/components/product/AddToCartButton";
import ProductSelection from "@/presentation/components/product/ProductSelection";
import { formatCurrency } from "@/lib/utils";

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

  return (
    <main className="flex-grow bg-white pt-24 pb-20">
      <BreadcrumbSetter 
        currentLabel={product.title} 
        parentLabels={{ [ROUTES.SHOP]: "Shop" }} 
      />
      
      <div className="max-w-[1440px] mx-auto px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left: Media Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden shadow-sm">
              {product.imageUrl ? (
                <img 
                  alt={product.title} 
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 hover:scale-105" 
                  src={product.imageUrl} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-6xl">image</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-slate-950 transition-all">
                   {product.imageUrl && <img src={product.imageUrl} alt="" className="w-full h-full object-cover mix-blend-multiply opacity-60" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 pt-4">
            <div className="mb-10">
              <p className="text-[11px] font-bold text-[#0051d5] uppercase tracking-[0.2em] mb-4">Bộ sưu tập cao cấp</p>
              <h1 className="text-4xl font-bold text-slate-950 mb-4 leading-tight">{product.title}</h1>
            </div>

            <div className="mb-10 pb-10 border-b border-slate-100">
              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description || "Được chế tác tỉ mỉ và thiết kế bền bỉ, sản phẩm này thể hiện cam kết của chúng tôi về chất lượng và tính thẩm mỹ tối giản."}
              </p>
            </div>

            <ProductSelection product={product} />

            <div className="mt-16 space-y-6">
              {[
                { title: "Product Story", icon: "history_edu" },
                { title: "Material & Care", icon: "eco" },
                { title: "Shipping & Returns", icon: "local_shipping" }
              ].map((item) => (
                <button key={item.title} className="w-full flex items-center justify-between py-6 border-t border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-950 transition-colors">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-950 uppercase tracking-widest">{item.title}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-950 transition-all">add</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
