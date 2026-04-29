import Link from "next/link";
import { makeGetProductsUseCase } from "@/infrastructure/supabase/container";
import { formatCurrency } from "@/lib/utils";
import { ProductDeleteButton } from "@/app/admin/products/ProductDeleteButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = typeof params.q === 'string' ? params.q : undefined;

  const getProductsUseCase = await makeGetProductsUseCase();
  
  const result = await getProductsUseCase.execute({ 
    limit, 
    offset, 
    search 
  });

  if (!result.success) {
    return <div>Error: {result.error.message}</div>;
  }

  const { products, total } = result.data;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-h1 text-on-surface">Sản phẩm</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Quản lý kho hàng, giá cả và tình trạng hiển thị.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-inverse-surface transition-colors duration-200 shadow-sm whitespace-nowrap h-12"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Thêm sản phẩm
        </Link>
      </div>
      
      {/* Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <form className="p-4 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright/50">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-xl">search</span>
            <input 
              name="q"
              defaultValue={search}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
              placeholder="Tìm theo tên, SKU..." 
              type="text" 
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-sm">Tìm kiếm</button>
          </div>
        </form>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright/30 border-b border-outline-variant/30 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 pl-6 w-12 font-medium">
                  <input className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest" type="checkbox" />
                </th>
                <th className="p-4 font-medium min-w-[250px]">Sản phẩm</th>
                <th className="p-4 font-medium text-right">Giá</th>
                <th className="p-4 font-medium text-right">Kho</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 pr-6 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/20">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg border border-outline-variant/20 bg-surface-container flex-shrink-0 overflow-hidden">
                        {product.imageUrl ? (
                          <img alt={product.title} className="w-full h-full object-cover" src={product.imageUrl} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-outline">
                            <span className="material-symbols-outlined">image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface group-hover:text-secondary transition-colors">{product.title}</div>
                        <div className="text-on-surface-variant text-xs mt-0.5">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium">{formatCurrency(product.price)}</td>
                  <td className="p-4 text-right">{product.stock}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
                      product.isActive 
                        ? "bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant" 
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      {product.isActive ? "Đang bán" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <Link 
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </Link>
                    <ProductDeleteButton id={product.id} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">Không tìm thấy sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-surface-bright/50">
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Hiển thị <span className="font-medium text-on-surface">{offset + 1}</span> đến <span className="font-medium text-on-surface">{Math.min(offset + limit, total)}</span> trong tổng số <span className="font-medium text-on-surface">{total}</span> kết quả
            </div>
            <div className="flex items-center gap-1">
              <Link 
                href={`/admin/products?page=${page - 1}${search ? `&q=${search}` : ''}`}
                className={`p-2 border border-outline-variant rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </Link>
              {/* Simplistic pagination */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/admin/products?page=${i + 1}${search ? `&q=${search}` : ''}`}
                  className={`w-9 h-9 border flex items-center justify-center rounded-md font-label-md text-label-md transition-colors ${
                    page === i + 1 
                      ? "border-primary bg-primary text-on-primary" 
                      : "border-outline-variant text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
              <Link 
                href={`/admin/products?page=${page + 1}${search ? `&q=${search}` : ''}`}
                className={`p-2 border border-outline-variant rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
