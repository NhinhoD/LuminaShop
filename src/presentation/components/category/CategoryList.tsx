"use client";

import { useState, useEffect } from "react";
import { Category } from "@/domain/entities/Category";
import { getCategoriesAction, deleteCategoryAction } from "@/presentation/actions/category";
import { CategoryForm } from "./CategoryForm";
import { CategoryCard, AddCategoryPlaceholder } from "./CategoryCard";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const result = await getCategoriesAction();
    if (result.data) {
      setCategories(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const result = await deleteCategoryAction(id);
      if (result.success) {
        fetchCategories();
      } else {
        alert(result.error || "Không thể xóa danh mục.");
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-12">
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                fetchCategories();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 animate-pulse h-[280px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
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
      )}
      
      {!loading && filteredCategories.length === 0 && searchTerm && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
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
