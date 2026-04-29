"use client";

import { Category } from "@/domain/entities/Category";

interface CategoryCardProps {
  category: Category;
  productCount?: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, productCount = 0, onEdit, onDelete }: CategoryCardProps) {
  // Simple icon mapping based on name/slug
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("men")) return "apparel";
    if (n.includes("electronics") || n.includes("tech")) return "laptop_mac";
    if (n.includes("home") || n.includes("living")) return "home";
    if (n.includes("sport")) return "fitness_center";
    if (n.includes("beauty") || n.includes("care")) return "face";
    return "category";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0051d5]">
          <span className="material-symbols-outlined text-2xl">{getIcon(category.name)}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{category.name}</h3>
        <p className="text-sm font-semibold text-[#0051d5] mb-3">/{category.slug}</p>
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
          {category.description || "No description provided for this collection."}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{productCount} Products</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
          Active
        </span>
      </div>
    </div>
  );
}

export function AddCategoryPlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-50/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all group flex flex-col items-center justify-center min-h-[280px] text-center"
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#0051d5] mb-4 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-2xl font-bold">add</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Category</h3>
      <p className="text-sm text-slate-500">Organize your store collections</p>
    </button>
  );
}
