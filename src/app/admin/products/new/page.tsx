import { makeGetCategoriesUseCase } from "@/infrastructure/supabase/container";
import { ProductForm } from "@/app/admin/products/ProductForm";

export default async function NewProductPage() {
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  
  const result = await getCategoriesUseCase.execute();
  const categories = result.success ? result.data : [];

  return (
    <div className="max-w-[1000px] mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-h1 text-on-surface">Thêm sản phẩm mới</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Điền thông tin chi tiết để tạo sản phẩm mới trong hệ thống.</p>
      </div>
      
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
