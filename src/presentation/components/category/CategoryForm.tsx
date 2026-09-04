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
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100 font-sans">
      <h3 className="text-base font-semibold text-slate-900 mb-4 tracking-tight">
        {category ? "Cập nhật danh mục" : "Thêm danh mục mới"}
      </h3>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-medium text-slate-700">Tên danh mục *</label>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button 
              type="button"
              onClick={() => setCurrentLang('vi')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${currentLang === 'vi' ? 'bg-white shadow-xs text-primary' : 'text-slate-500'}`}
            >
              Tiếng Việt
            </button>
            <button 
              type="button"
              onClick={() => setCurrentLang('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${currentLang === 'en' ? 'bg-white shadow-xs text-primary' : 'text-slate-500'}`}
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
          className="w-full h-10 px-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-normal"
          required
        />
        <p className="text-xs text-slate-400 font-mono">Slug: {generateSlug(name.vi || name.en || "category") || "..."}</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-medium text-slate-700">Mô tả</label>
        </div>
        <textarea
          value={description[currentLang] || ""}
          onChange={(e) => setDescription({ ...description, [currentLang]: e.target.value })}
          placeholder={currentLang === 'vi' ? "Mô tả ngắn gọn về danh mục..." : "Brief description of the category..."}
          rows={3}
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm font-normal"
        />
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-xs cursor-pointer active:scale-95"
        >
          {loading ? "Đang xử lý..." : category ? "Cập nhật" : "Tạo mới"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
