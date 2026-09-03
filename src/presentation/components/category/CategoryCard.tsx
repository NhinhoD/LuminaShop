"use client";

import { Category } from "@/domain/entities/Category";
import { useLocale } from "@/presentation/hooks/useLocale";
import { getLocalizedText } from "@/presentation/utils/locale";
import { 
  FolderTree, 
  Laptop, 
  Layout, 
  Code2, 
  Cpu, 
  Palette, 
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

  const renderIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("e-commerce") || n.includes("shop")) return <Layout size={20} />;
    if (n.includes("admin") || n.includes("dashboard")) return <Cpu size={20} />;
    if (n.includes("portfolio") || n.includes("landing")) return <Code2 size={20} />;
    if (n.includes("design") || n.includes("ui")) return <Palette size={20} />;
    if (n.includes("tech") || n.includes("code") || n.includes("template")) return <Laptop size={20} />;
    return <FolderTree size={20} />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-primary/40 transition-all group relative flex flex-col h-full font-sans">
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {renderIcon(getLocalizedText(category.name, locale))}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
            title="Edit"
            type="button"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            title="Delete"
            type="button"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">{getLocalizedText(category.name, locale)}</h3>
        <p className="text-xs font-bold text-primary mb-2.5 font-mono">/{category.slug}</p>
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 font-medium">
          {getLocalizedText(category.description, locale) || "No description provided for this collection."}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
        <span className="font-bold text-slate-400">{productCount} Products</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 uppercase">
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
      className="bg-slate-50/70 rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group flex flex-col items-center justify-center min-h-[260px] text-center cursor-pointer font-sans"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-105 transition-transform">
        <Plus size={20} />
      </div>
      <h3 className="text-sm font-extrabold text-slate-900 mb-1">Add New Category</h3>
      <p className="text-xs text-slate-400 font-medium font-mono">Organize your codebase catalog</p>
    </button>
  );
}
