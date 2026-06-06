"use client";

import { useState } from "react";
import { Category } from "@/domain/entities/Category";
import { createCategoryAction, updateCategoryAction } from "@/presentation/actions/category";
import { generateSlug } from "@/lib/utils";

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>('vi');
  const [name, setName] = useState<Record<string, string>>(category?.name || { vi: '', en: '' });
  const [description, setDescription] = useState<Record<string, string>>(category?.description || { vi: '', en: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const slug = generateSlug(name.vi || name.en || "category");
    
    try {
      if (category) {
        const result = await updateCategoryAction(category.id, {
          name,
          slug,
          description,
        });
        if (result.error) {
          setError(result.error);
        } else {
          onSuccess();
        }
      } else {
        const result = await createCategoryAction({
          name,
          slug,
          description,
        });
        if (result.error) {
          setError(result.error);
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {category ? "Cập nhật danh mục" : "Thêm danh mục mới"}
      </h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-slate-700">Tên danh mục</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              type="button"
              onClick={() => setCurrentLang('vi')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${currentLang === 'vi' ? 'bg-white shadow-sm text-[#0051d5]' : 'text-slate-500'}`}
            >
              Tiếng Việt
            </button>
            <button 
              type="button"
              onClick={() => setCurrentLang('en')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${currentLang === 'en' ? 'bg-white shadow-sm text-[#0051d5]' : 'text-slate-500'}`}
            >
              English
            </button>
          </div>
        </div>
        <input
          type="text"
          value={name[currentLang] || ""}
          onChange={(e) => setName({ ...name, [currentLang]: e.target.value })}
          placeholder={currentLang === 'vi' ? "Ví dụ: Giao diện cá nhân" : "Example: Personal Portfolio"}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          required
        />
        <p className="text-xs text-slate-500 italic">Slug sẽ được tự động tạo: {generateSlug(name.vi || name.en || "category") || "..."}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-slate-700">Mô tả</label>
        </div>
        <textarea
          value={description[currentLang] || ""}
          onChange={(e) => setDescription({ ...description, [currentLang]: e.target.value })}
          placeholder={currentLang === 'vi' ? "Mô tả ngắn gọn về danh mục..." : "Brief description of the category..."}
          rows={3}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#0051d5] text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : category ? "Cập nhật" : "Tạo mới"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
