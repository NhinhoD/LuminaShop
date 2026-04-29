"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/presentation/actions/product";
import { Category } from "@/domain/entities/Category";
import { CreateProductDTO, UpdateProductDTO } from "@/domain/entities/Product";

interface ProductFormProps {
  categories: Category[];
  initialData?: any; // For editing
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    imageUrl: initialData?.imageUrl || "",
    isActive: initialData?.isActive ?? true,
  });

  const [variants, setVariants] = useState<any[]>(initialData?.variants || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", priceAdjustment: 0, stockQuantity: 0 }]);
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index][field] = field === 'priceAdjustment' || field === 'stockQuantity' ? parseInt(value) || 0 : value;
    setVariants(newVariants);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      ...formData,
      variants: variants.length > 0 ? variants : undefined
    };

    let result;
    if (initialData?.id) {
      result = await updateProductAction(initialData.id, payload as UpdateProductDTO);
    } else {
      result = await createProductAction(payload as CreateProductDTO);
    }
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface">Tên sản phẩm</label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none"
            placeholder="Ví dụ: Áo thun Cotton"
          />
        </div>


        <div className="space-y-2 md:col-span-2">
          <label className="text-label-md font-medium text-on-surface">Mô tả</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none"
            placeholder="Nhập mô tả chi tiết sản phẩm..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface">Danh mục</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface">URL Hình ảnh</label>
          <input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface">Giá cơ bản (VND)</label>
          <input
            required
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface">Tồn kho tổng</label>
          <input
            required
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-h3 text-on-surface">Biến thể sản phẩm</h3>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm biến thể
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-surface-container rounded-lg relative">
              <button
                type="button"
                onClick={() => handleRemoveVariant(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-error text-on-error rounded-full flex items-center justify-center text-xs"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
              <div className="space-y-1">
                <label className="text-xs text-on-surface-variant">Tên (ví dụ: Size L, Màu Đỏ)</label>
                <input
                  required
                  value={v.name}
                  onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-on-surface-variant">Giá chênh lệch</label>
                <input
                  type="number"
                  value={v.priceAdjustment}
                  onChange={(e) => handleVariantChange(i, 'priceAdjustment', e.target.value)}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-on-surface-variant">Số lượng</label>
                <input
                  type="number"
                  value={v.stockQuantity}
                  onChange={(e) => handleVariantChange(i, 'stockQuantity', e.target.value)}
                  className="w-full px-3 py-1.5 border border-outline-variant rounded text-sm"
                />
              </div>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="text-sm text-on-surface-variant italic">Không có biến thể nào được tạo.</p>
          )}
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-inverse-surface transition-colors disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>
    </form>
  );
}
