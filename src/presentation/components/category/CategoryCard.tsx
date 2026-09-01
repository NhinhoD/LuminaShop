"use client";

import { Category } from "@/domain/entities/Category";
import { useLocale } from "@/presentation/hooks/useLocale";
import { getLocalizedText } from "@/presentation/utils/locale";
import { 
  FolderTree, 
  Laptop, 
  Shirt, 
  Home, 
  Dumbbell, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Plus 
} from "lucide-react";
import React from "react";

interface CategoryCardProps {
  category: Category;
  productCount?: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryCard({ category, productCount = 0, onEdit, onDelete }: CategoryCardProps) {
  const locale = useLocale();

  // Icon mapping based on name/slug
  const renderIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("men") || n.includes("fashion") || n.includes("shirt")) return <Shirt size={22} />;
    if (n.includes("electronics") || n.includes("tech") || n.includes("code") || n.includes("template")) return <Laptop size={22} />;
    if (n.includes("home") || n.includes("living")) return <Home size={22} />;
    if (n.includes("sport") || n.includes("fitness")) return <Dumbbell size={22} />;
    if (n.includes("beauty") || n.includes("care") || n.includes("art")) return <Sparkles size={22} />;
    return <FolderTree size={22} />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative flex flex-col h-full font-manrope">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0051d5]">
          {renderIcon(getLocalizedText(category.name, locale))}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-slate-400 hover:text-[#0051d5] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
            title="Edit"
            type="button"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            title="Delete"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-1 font-playfair">{getLocalizedText(category.name, locale)}</h3>
        <p className="text-xs font-bold text-[#0051d5] mb-3 font-mono">/{category.slug}</p>
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 font-medium">
          {getLocalizedText(category.description, locale) || "No description provided for this collection."}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{productCount} Products</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 uppercase tracking-wider">
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
      type="button"
      className="bg-slate-50/50 rounded-3xl p-6 border-2 border-dashed border-slate-200 hover:border-[#0051d5] hover:bg-blue-50/30 transition-all group flex flex-col items-center justify-center min-h-[280px] text-center cursor-pointer font-manrope"
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-100/70 flex items-center justify-center text-[#0051d5] mb-4 group-hover:scale-110 transition-transform">
        <Plus size={24} />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1 font-playfair">Add New Category</h3>
      <p className="text-xs text-slate-400 font-medium">Organize your store collections</p>
    </button>
  );
}
