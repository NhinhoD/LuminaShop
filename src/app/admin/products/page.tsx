import Link from "next/link";
import Image from "next/image";
import { makeGetProductsUseCase, makeGetCategoriesUseCase, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { formatCurrency } from "@/lib/utils";
import { ProductDeleteButton } from "@/app/admin/products/ProductDeleteButton";
import { PaginationControls } from "@/presentation/components/common/PaginationControls";
import { getDictionary, getLocale } from "@/i18n/getDictionary";
import { getLocalizedText } from "@/presentation/utils/locale";
import { Plus, Search, Edit3, Package, Image as ImageIcon } from "lucide-react";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const repo = await makeLanguageRepository();
  const dictionary = await getDictionary(repo);
  const dict = (dictionary.products as Record<string, string>) || {};
  const locale = await getLocale();
  
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = typeof params.q === 'string' ? params.q : undefined;
  const categoryId = typeof params.category === 'string' && params.category !== 'all' ? params.category : undefined;
  
  let isActive: boolean | undefined = undefined;
  if (params.status === 'active') isActive = true;
  if (params.status === 'inactive') isActive = false;

  const getProductsUseCase = await makeGetProductsUseCase();
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  
  const [result, categoriesResult] = await Promise.all([
    getProductsUseCase.execute({ limit, offset, search, categoryId, isActive }),
    getCategoriesUseCase.execute()
  ]);

  if (!result.success) {
    return <div>Error: {result.error?.message || "Failed to load products"}</div>;
  }

  const { products, total } = result.data;
  const categories = categoriesResult.success ? categoriesResult.data.categories : [];
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 font-sans">{dict.title || "Quản lý sản phẩm"}</h2>
          <p className="text-sm text-slate-500 mt-1">{dict.subtitle || "Danh sách mẫu template hiện có"} ({total})</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-[#0051d5] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0041ab] transition-all duration-200 shadow-md shadow-blue-900/10 text-xs uppercase tracking-wider whitespace-nowrap h-11 active:scale-95"
        >
          <Plus size={16} />
          <span>{dict.addProduct || "Thêm sản phẩm"}</span>
        </Link>
      </div>
      
      {/* Data Table Container */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <form className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/70">
          <div className="flex gap-4 w-full sm:w-auto flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                name="q"
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all shadow-sm" 
                placeholder={dict.searchPlaceholder || "Tìm kiếm sản phẩm..."} 
                type="text" 
              />
            </div>
            <select name="category" defaultValue={params.category || "all"} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0051d5] shadow-sm font-semibold text-slate-700">
              <option value="all">{dict.filterCategory || "Tất cả danh mục"}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{getLocalizedText(c.name as unknown as Record<string, string>, locale)}</option>
              ))}
            </select>
            <select name="status" defaultValue={params.status || "all"} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0051d5] shadow-sm font-semibold text-slate-700">
              <option value="all">{dict.filterStatus || "Tất cả trạng thái"}</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm cursor-pointer active:scale-95">
              Lọc
            </button>
          </div>
        </form>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6 w-12">
                  <input className="rounded border-slate-200 text-[#0051d5] focus:ring-[#0051d5]" type="checkbox" />
                </th>
                <th className="p-4 min-w-[250px]">{dict.tableProduct || "SẢN PHẨM"}</th>
                <th className="p-4 text-right">{dict.tablePrice || "GIÁ"}</th>
                <th className="p-4 text-right">{dict.tableStock || "TỒN KHO"}</th>
                <th className="p-4">{dict.tableStatus || "TRẠNG THÁI"}</th>
                <th className="p-4 pr-6 text-right">{dict.tableActions || "HÀNH ĐỘNG"}</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100 bg-white">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 pl-6">
                    <input className="rounded border-slate-200 text-[#0051d5] focus:ring-[#0051d5]" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 overflow-hidden shadow-sm relative">
                        {product.imageUrl ? (
                          <Image alt={getLocalizedText(product.title as unknown as Record<string, string>, locale)} className="object-cover group-hover:scale-105 transition-transform duration-300" src={product.imageUrl} fill sizes="56px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-[#0051d5] transition-colors text-xs md:text-sm">{getLocalizedText(product.title as unknown as Record<string, string>, locale)}</div>
                        <div className="text-slate-400 text-[11px] font-mono mt-0.5">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900 text-xs md:text-sm">{product.price === 0 ? "MIỄN PHÍ" : formatCurrency(product.price)}</td>
                  <td className="p-4 text-right font-semibold text-xs">{product.stock}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      product.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {product.isActive ? "Đang bán" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1">
                    <Link 
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex p-2 text-slate-400 hover:text-[#0051d5] transition-colors rounded-lg hover:bg-blue-50"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={18} />
                    </Link>
                    <ProductDeleteButton id={product.id} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Package size={40} className="text-slate-300" />
                      <p className="text-xs font-bold">{dict.noProducts || "Không tìm thấy sản phẩm nào"}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center flex-col items-center">
            <div className="text-center mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Hiển thị <span className="text-slate-900">{offset + 1}</span> - <span className="text-slate-900">{Math.min(offset + limit, total)}</span> / <span className="text-slate-900">{total}</span>
            </div>
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}

