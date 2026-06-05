"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Category } from "@/domain/entities/Category";
import { deleteCategoryAction } from "@/presentation/actions/category";
import { CategoryForm } from "./CategoryForm";
import { CategoryCard, AddCategoryPlaceholder } from "./CategoryCard";
import { useDebouncedCallback } from "use-debounce";

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
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const result = await deleteCategoryAction(id);
      if (!result.success) {
        alert(result.error || "Không thể xóa danh mục.");
      }
      // revalidatePath in action will refresh data automatically
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-slate-500 font-medium">Create and organize your product collections</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-[#0051d5] outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditingCategory(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-[#0051d5] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined">add</span>
            Add Category
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
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="material-symbols-outlined text-slate-300 text-3xl">search_off</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No categories found</h3>
          <p className="text-slate-500">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
