import Link from "next/link";
import { makeProductRepository } from "@/infrastructure/supabase/container";
import { ROUTES } from "@/presentation/constants";
import ShopProductGrid from "@/presentation/components/product/ShopProductGrid";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";

interface ShopPageProps {
  searchParams: Promise<{ page?: string; limit?: string; q?: string; sort?: string; category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = parseInt(params.limit || "9", 10); // 3x3 grid
  const offset = (currentPage - 1) * itemsPerPage;
  const search = typeof params.q === 'string' ? params.q : undefined;
  const categoryId = typeof params.category === 'string' ? params.category : undefined;
  
  let sortType: 'newest' | 'price_asc' | 'price_desc' | 'popular' = 'newest';
  if (
    params.sort === 'price_asc' || 
    params.sort === 'price_desc' || 
    params.sort === 'popular'
  ) {
    sortType = params.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular';
  }

  const productRepository = await makeProductRepository();
  const { products, total } = await productRepository.findAll({ 
    limit: itemsPerPage, 
    offset, 
    isActive: true,
    search,
    categoryId,
    sort: sortType
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
        </div>

        <ShopProductGrid 
          initialProducts={products} 
          currentSearch={search || ""} 
          currentSort={sortType} 
          currentCategory={categoryId || "all"}
        />
        
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <PaginationControls currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  );
}
