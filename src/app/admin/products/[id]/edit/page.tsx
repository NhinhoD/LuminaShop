import { 
  makeGetCategoriesUseCase, 
  makeGetProductByIdUseCase,
  makeLanguageRepository
} from "@/infrastructure/supabase/container";
import { ProductForm } from "@/app/admin/products/ProductForm";
import { notFound } from "next/navigation";
import { getDictionary, getLocale } from "@/i18n/getDictionary";

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
  const langRepo = await makeLanguageRepository();
  const dict = await getDictionary(langRepo);
  const adminDict = (dict?.admin as Record<string, string>) || {};
  
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  const getProductByIdUseCase = await makeGetProductByIdUseCase();
  
  const [categoriesResult, productResult] = await Promise.all([
    getCategoriesUseCase.execute(),
    getProductByIdUseCase.execute(id)
  ]);

  if (!productResult.success) {
    notFound();
  }

  const categories = categoriesResult.success ? categoriesResult.data.categories : [];
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
