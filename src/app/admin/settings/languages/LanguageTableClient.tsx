"use client";

import { useState, useTransition } from "react";
import { updateTranslationAction } from "@/presentation/actions/i18n";
import { TranslationEntry } from "@/domain/repositories/ITranslationRepository";

export default function LanguageTableClient({ initialTranslations }: { initialTranslations: TranslationEntry[] }) {
  const [translations, setTranslations] = useState(initialTranslations);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEdit = (entry: TranslationEntry) => {
    setEditingKey(entry.key);
    setEditVi(entry.vi);
    setEditEn(entry.en);
  };

  const handleSave = async (key: string) => {
    startTransition(async () => {
      const res = await updateTranslationAction(key, editVi, editEn);
      if (res.success) {
        setTranslations(prev => prev.map(t => t.key === key ? { ...t, vi: editVi, en: editEn } : t));
        setEditingKey(null);
      } else {
        alert("Failed to update translation: " + res.error);
      }
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-4 pl-6">Key (Mã)</th>
              <th className="p-4 w-1/3">Tiếng Việt (VI)</th>
              <th className="p-4 w-1/3">Tiếng Anh (EN)</th>
              <th className="p-4 pr-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
            {translations.map((entry) => (
              <tr key={entry.key} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 pl-6 font-medium text-slate-500 text-xs">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{entry.key}</span>
                </td>
                
                <td className="p-4">
                  {editingKey === entry.key ? (
                    <textarea 
                      className="w-full border border-slate-300 rounded-md p-2 focus:border-[#0051d5] outline-none text-sm"
                      rows={2}
                      value={editVi}
                      onChange={(e) => setEditVi(e.target.value)}
                    />
                  ) : (
                    <div className="text-slate-900 font-medium">{entry.vi}</div>
                  )}
                </td>
                
                <td className="p-4">
                  {editingKey === entry.key ? (
                    <textarea 
                      className="w-full border border-slate-300 rounded-md p-2 focus:border-[#0051d5] outline-none text-sm"
                      rows={2}
                      value={editEn}
                      onChange={(e) => setEditEn(e.target.value)}
                    />
                  ) : (
                    <div className="text-slate-900 font-medium">{entry.en}</div>
                  )}
                </td>
                
                <td className="p-4 pr-6 text-right">
                  {editingKey === entry.key ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingKey(null)}
                        disabled={isPending}
                        className="text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={() => handleSave(entry.key)}
                        disabled={isPending}
                        className="bg-[#0051d5] text-white font-medium px-4 py-1.5 rounded-lg hover:bg-[#0041ab]"
                      >
                        {isPending ? "Đang lưu..." : "Lưu"}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEdit(entry)}
                      className="text-slate-400 hover:text-[#0051d5] p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
