"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Category } from "@/domain/entities/Category";
import { deleteCategoryAction } from "@/presentation/actions/category";
import { CategoryForm } from "./CategoryForm";
import { CategoryCard, AddCategoryPlaceholder } from "./CategoryCard";
import { useDebouncedCallback } from "use-debounce";
import { Search, Plus, SearchX } from "lucide-react";
import { toast } from "@/presentation/hooks/useToastStore";
import { useLocale } from "@/presentation/hooks/useLocale";
import { useI18n } from "@/presentation/components/common/I18nContext";

interface CategoryListProps {
  initialCategories: Category[];
  total: number;
  currentPage: number;
  totalPages: number;
  search?: string;
}

export function CategoryList({ initialCategories, search }: CategoryListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { dict } = useI18n();
  const adminDict = (dict?.admin as Record<string, string>) || {};
  
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(search || "");

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('page', '1'); // Reset to first page on search
    router.push(`${pathname}?${params.toString()}`);
  }, 500);

  const handleDelete = async (id: string) => {
    if (confirm(adminDict.deleteCategoryConfirm || (locale === "vi" ? "Bạn có chắc chắn muốn xóa danh mục này?" : "Are you sure you want to delete this category?"))) {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        toast.success(adminDict.categoryDeleteSuccess || (locale === "vi" ? "Đã xóa danh mục thành công!" : "Category deleted successfully!"));
      } else {
        toast.error(adminDict.categoryDeleteError || (locale === "vi" ? "Không thể xóa danh mục" : "Cannot delete category"), result.error || (locale === "vi" ? "Vui lòng thử lại sau." : "Please try again."));
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-4 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-sans">
            {adminDict.categoriesTitle || (locale === "vi" ? "Quản lý danh mục" : "Category Management")}
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            {adminDict.categoriesSubtitle || (locale === "vi" ? "Tạo và tổ chức bộ sưu tập giao diện" : "Create and organize your product collections")}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={adminDict.searchCategoriesPlaceholder || (locale === "vi" ? "Tìm kiếm danh mục..." : "Search categories...")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => {
              setEditingCategory(undefined);
              setShowForm(true);
            }}
            type="button"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-xs hover:bg-primary-dark transition-all active:scale-95 whitespace-nowrap text-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>{adminDict.addCategory || (locale === "vi" ? "Thêm danh mục" : "Add Category")}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-xl animate-in fade-in zoom-in duration-200">
            <CategoryForm
              category={editingCategory}
              onSuccess={() => {
                setShowForm(false);
                toast.success(editingCategory ? "Cập nhật danh mục thành công!" : "Tạo danh mục mới thành công!");
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            productCount={category.productCount}
            onEdit={(c) => {
              setEditingCategory(c);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        ))}
        
        <AddCategoryPlaceholder 
          onClick={() => {
            setEditingCategory(undefined);
            setShowForm(true);
          }} 
        />
      </div>
      
      {initialCategories.length === 0 && search && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 col-span-full">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
            <SearchX size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-sans">No categories found</h3>
          <p className="text-xs text-slate-400 font-medium">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}

