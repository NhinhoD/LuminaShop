import { 
  makeGetCategoriesUseCase, 
  makeGetProductByIdUseCase,
  getAppDictionary
} from "@/di/container";
import { ProductForm } from "@/app/admin/products/ProductForm";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/getDictionary";

/**
 * Admin product editing page.
 * Loads product data and renders the ProductForm with existing values for editing.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const adminDict = (dict?.admin as Record<string, string>) || {};
  
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  const getProductByIdUseCase = await makeGetProductByIdUseCase();
  
  const [categoriesResult, productResult] = await Promise.all([
    getCategoriesUseCase.execute(),
    getProductByIdUseCase.execute(id)
  ]);

  if (!categoriesResult.success) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
        <p className="font-semibold text-sm">
          {locale === "vi" ? "Không thể tải danh mục sản phẩm từ máy chủ" : "Failed to load categories from database"}
        </p>
        <p className="text-xs text-red-500 mt-1 font-mono">
          {categoriesResult.error.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!productResult.success) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
        <p className="font-semibold text-sm">
          {locale === "vi" ? "Không thể tải thông tin sản phẩm từ máy chủ" : "Failed to load product details from database"}
        </p>
        <p className="text-xs text-red-500 mt-1 font-mono">
          {productResult.error.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!productResult.data) {
    notFound();
  }

  const categories = categoriesResult.data.categories;
  const product = productResult.data;

  return (
    <div className="max-w-[1000px] mx-auto w-full font-sans">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          {adminDict.editProductTitle || (locale === "vi" ? "Chỉnh sửa sản phẩm" : "Edit Product")}
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          {adminDict.editProductSubtitle || (locale === "vi" ? "Cập nhật thông tin chi tiết của sản phẩm." : "Update the details, assets, and metadata of this product template.")}
        </p>
      </div>
      
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xs p-6 md:p-8">
        <ProductForm 
          categories={categories} 
          initialData={product} 
        />
      </div>
    </div>
  );
}
