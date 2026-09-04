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
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-sans">
            {dict.title || (locale === "vi" ? "Quản lý sản phẩm" : "Product Management")}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {dict.subtitle || (locale === "vi" ? "Danh sách mẫu template hiện có trong hệ thống" : "List of digital templates in catalog")} ({total})
          </p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white font-medium px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all duration-150 shadow-xs text-xs whitespace-nowrap active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>{dict.addProduct || (locale === "vi" ? "Thêm sản phẩm" : "Add Product")}</span>
        </Link>
      </div>
      
      {/* Data Table Container */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar */}
        <form className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                name="q"
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                placeholder={dict.searchPlaceholder || (locale === "vi" ? "Tìm kiếm sản phẩm..." : "Search products...")} 
                type="text" 
              />
            </div>
            <select name="category" defaultValue={params.category || "all"} className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-normal text-slate-700">
              <option value="all">{dict.filterCategory || (locale === "vi" ? "Tất cả danh mục" : "All Categories")}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{getLocalizedText(c.name as unknown as Record<string, string>, locale)}</option>
              ))}
            </select>
            <select name="status" defaultValue={params.status || "all"} className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-normal text-slate-700">
              <option value="all">{dict.filterStatus || (locale === "vi" ? "Tất cả trạng thái" : "All Statuses")}</option>
              <option value="active">{locale === "vi" ? "Đang bán" : "Active"}</option>
              <option value="inactive">{locale === "vi" ? "Ẩn" : "Hidden"}</option>
            </select>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-95">
              {locale === "vi" ? "Lọc" : "Filter"}
            </button>
          </div>
        </form>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs font-medium text-slate-500">
                <th className="p-4 pl-6 w-12">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary/20" type="checkbox" />
                </th>
                <th className="p-4 min-w-[250px]">{dict.tableProduct || (locale === "vi" ? "SẢN PHẨM" : "PRODUCT")}</th>
                <th className="p-4 text-right">{dict.tablePrice || (locale === "vi" ? "GIÁ BẢN QUYỀN" : "PRICE")}</th>
                <th className="p-4 text-right">{dict.tableStock || (locale === "vi" ? "TỒN KHO" : "STOCK")}</th>
                <th className="p-4">{dict.tableStatus || (locale === "vi" ? "TRẠNG THÁI" : "STATUS")}</th>
                <th className="p-4 pr-6 text-right">{dict.tableActions || (locale === "vi" ? "THAO TÁC" : "ACTIONS")}</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100 bg-white">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="p-4 pl-6">
                    <input className="rounded border-slate-300 text-primary focus:ring-primary/20" type="checkbox" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 overflow-hidden shadow-2xs relative">
                        {product.imageUrl ? (
                          <Image alt={getLocalizedText(product.title as unknown as Record<string, string>, locale)} className="object-cover group-hover:scale-105 transition-transform duration-300" src={product.imageUrl} fill sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">{getLocalizedText(product.title as unknown as Record<string, string>, locale)}</div>
                        <div className="text-slate-400 text-xs font-mono mt-0.5">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900 text-sm font-mono">{product.price === 0 ? (locale === "vi" ? "Miễn phí" : "Free") : formatCurrency(product.price, locale)}</td>
                  <td className="p-4 text-right font-normal text-xs text-slate-600 font-mono">{product.stock}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                        : "bg-slate-100 text-slate-600 border border-slate-200/60"
                    }`}>
                      {product.isActive ? (locale === "vi" ? "Đang bán" : "Active") : (locale === "vi" ? "Ẩn" : "Hidden")}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1">
                    <Link 
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                      title={locale === "vi" ? "Chỉnh sửa" : "Edit"}
                    >
                      <Edit3 size={16} />
                    </Link>
                    <ProductDeleteButton id={product.id} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Package size={36} className="text-slate-300" />
                      <p className="text-xs font-normal">{dict.noProducts || (locale === "vi" ? "Không tìm thấy sản phẩm nào" : "No products found")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center flex-col items-center">
            <div className="text-center mb-3 text-xs font-normal text-slate-500">
              {locale === "vi" ? "Hiển thị" : "Showing"} <span className="text-slate-900 font-medium">{offset + 1}</span> - <span className="text-slate-900 font-medium">{Math.min(offset + limit, total)}</span> {locale === "vi" ? "trên" : "of"} <span className="text-slate-900 font-medium">{total}</span>
            </div>
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}

