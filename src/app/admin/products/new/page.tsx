import { makeGetCategoriesUseCase, makeLanguageRepository } from "@/infrastructure/supabase/container";
import { ProductForm } from "@/app/admin/products/ProductForm";
import { getDictionary, getLocale } from "@/i18n/getDictionary";

/**
 * Admin new product creation page.
 * Renders the ProductForm in create mode with empty initial values.
 */
export default async function NewProductPage() {
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  const locale = await getLocale();
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict?.admin as Record<string, string>) || {};
  
  const result = await getCategoriesUseCase.execute();
  const categories = result.success ? result.data.categories : [];

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
