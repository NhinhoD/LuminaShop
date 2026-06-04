import Link from "next/link";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import { ROUTES } from "@/presentation/constants";
import ShopProductGrid from "@/presentation/components/product/ShopProductGrid";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";

interface ShopPageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = parseInt(params.limit || "10", 10);
  const offset = (currentPage - 1) * itemsPerPage;

  const productRepository = await makeProductRepository();
  const { products, total } = await productRepository.findAll({ 
    limit: itemsPerPage, 
    offset, 
    isActive: true 
  });
  
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <main className="flex-grow bg-white pt-24 pb-20 font-bricolage">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-100 pb-8">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              <Link href={ROUTES.HOME} className="hover:text-slate-900 transition-colors">HOME</Link>
              <span>/</span>
              <span className="text-slate-900">SHOP ALL</span>
            </nav>
            <h1 className="text-4xl font-bold text-slate-950 mb-2">Our Collection</h1>
            <p className="text-slate-500 text-sm">Discover pieces designed for modern life. ({total} templates)</p>
          </div>
          
          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sort By:</span>
            <select className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer">
              <option>Newest Arrivals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>

        <ShopProductGrid initialProducts={products} />
        
        <PaginationControls currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}
