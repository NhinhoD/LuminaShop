"use client";

import { useState, useTransition } from "react";
import { updateTranslationAction } from "@/presentation/actions/i18n";
import { TranslationEntry } from "@/domain/repositories/ITranslationRepository";
import { Edit3 } from "lucide-react";
import { toast } from "@/presentation/hooks/useToastStore";

export default function LanguageTableClient({ 
  initialTranslations,
  locale = "vi"
}: { 
  initialTranslations: TranslationEntry[];
  locale?: string;
}) {
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
        toast.success(
          locale === "vi" ? "Lưu bản dịch thành công!" : "Translation saved successfully!",
          locale === "vi" ? `Đã cập nhật khóa: ${key}` : `Updated key: ${key}`
        );
      } else {
        toast.error(
          locale === "vi" ? "Không thể lưu bản dịch" : "Failed to save translation",
          res.error || (locale === "vi" ? "Vui lòng thử lại sau." : "Please try again later.")
        );
      }
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-medium text-slate-500">
              <th className="p-4 pl-6">{locale === "vi" ? "Mã khóa (Key)" : "Translation Key"}</th>
              <th className="p-4 w-1/3">Tiếng Việt (VI)</th>
              <th className="p-4 w-1/3">English (EN)</th>
              <th className="p-4 pr-6 text-right">{locale === "vi" ? "Thao tác" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
            {translations.map((entry) => (
              <tr key={entry.key} className="hover:bg-slate-50/60 transition-colors group">
                <td className="p-4 pl-6 font-mono font-medium text-slate-700 text-xs">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{entry.key}</span>
                </td>
                
                <td className="p-4">
                  {editingKey === entry.key ? (
                    <textarea 
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-primary outline-none text-xs resize-none"
                      rows={2}
                      value={editVi}
                      onChange={(e) => setEditVi(e.target.value)}
                    />
                  ) : (
                    <div className="text-slate-900 font-normal">{entry.vi}</div>
                  )}
                </td>
                
                <td className="p-4">
                  {editingKey === entry.key ? (
                    <textarea 
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-primary outline-none text-xs resize-none"
                      rows={2}
                      value={editEn}
                      onChange={(e) => setEditEn(e.target.value)}
                    />
                  ) : (
                    <div className="text-slate-900 font-normal">{entry.en}</div>
                  )}
                </td>
                
                <td className="p-4 pr-6 text-right">
                  {editingKey === entry.key ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingKey(null)}
                        disabled={isPending}
                        type="button"
                        className="text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer text-xs"
                      >
                        {locale === "vi" ? "Hủy" : "Cancel"}
                      </button>
                      <button 
                        onClick={() => handleSave(entry.key)}
                        disabled={isPending}
                        type="button"
                        className="bg-primary text-white font-medium px-4 py-1.5 rounded-lg hover:bg-primary-dark cursor-pointer text-xs shadow-xs"
                      >
                        {isPending 
                          ? (locale === "vi" ? "Đang lưu..." : "Saving...") 
                          : (locale === "vi" ? "Lưu" : "Save")}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEdit(entry)}
                      type="button"
                      className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                      title={locale === "vi" ? "Chỉnh sửa" : "Edit"}
                    >
                      <Edit3 size={15} />
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

