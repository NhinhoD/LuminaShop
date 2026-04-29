import { 
  makeGetCategoriesUseCase, 
  makeGetProductByIdUseCase 
} from "@/infrastructure/supabase/container";
import { ProductForm } from "@/app/admin/products/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const getCategoriesUseCase = await makeGetCategoriesUseCase();
  const getProductByIdUseCase = await makeGetProductByIdUseCase();
  
  const [categoriesResult, productResult] = await Promise.all([
    getCategoriesUseCase.execute(),
    getProductByIdUseCase.execute(id)
  ]);

  if (!productResult.success) {
    notFound();
  }

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const product = productResult.data;

  return (
    <div className="max-w-[1000px] mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-h1 text-on-surface">Chỉnh sửa sản phẩm</h2>
        <p className="text-body-md text-on-surface-variant mt-1">Cập nhật thông tin chi tiết của sản phẩm.</p>
      </div>
      
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-8">
        <ProductForm 
          categories={categories} 
          initialData={product} 
        />
      </div>
    </div>
  );
}
