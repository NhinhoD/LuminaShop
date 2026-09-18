import { makeGetCategoriesUseCase, getAppDictionary } from "@/server/di/container";
import { ProductForm } from "@/app/admin/products/ProductForm";
import { getLocale } from "@/i18n/getDictionary";

/**
 * Admin new product creation page.
 * Renders the ProductForm in create mode with empty initial values.
 */
export default async function NewProductPage() {
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  const locale = await getLocale();
  const dict = await getAppDictionary();
  const adminDict = (dict?.admin as Record<string, string>) || {};
  
  const result = await getCategoriesUseCase.execute();
  if (!result.success) {
    console.error("NewProductPage: failed to load categories:", result.error);
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl text-red-700 max-w-xl mx-auto my-12 font-sans">
        <p className="font-semibold text-sm">
          {locale === "vi" ? "Không thể tải danh mục sản phẩm từ máy chủ" : "Failed to load categories from database"}
        </p>
        <p className="text-xs text-red-500 mt-1">
          {locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later."}
        </p>
      </div>
    );
  }

  const categories = result.data.categories;

  return (
    <div className="max-w-[1000px] mx-auto w-full font-sans">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          {adminDict.newProductTitle || (locale === "vi" ? "Thêm sản phẩm mới" : "Add New Product")}
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-normal">
          {adminDict.newProductSubtitle || (locale === "vi" ? "Điền thông tin chi tiết để tạo sản phẩm mới trong hệ thống." : "Fill in the details to publish a new digital template to the marketplace.")}
        </p>
      </div>
      
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xs p-6 md:p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
