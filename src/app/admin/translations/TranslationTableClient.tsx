"use client";

import { useState, useTransition } from 'react';
import { TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { Edit3, Plus, Trash2, Search, Check, X, RefreshCw, Layers } from 'lucide-react';
import { addTranslationAction, updateTranslationAction, deleteTranslationAction, syncAllTranslationsAction } from '@/presentation/actions/i18n';
import { useRouter } from 'next/navigation';
import { toast } from '@/presentation/hooks/useToastStore';
import { useLocale } from "@/presentation/hooks/useLocale";
import React from 'react';

export default function TranslationTableClient({ initialTranslations }: { initialTranslations: TranslationEntry[] }): React.ReactElement {
  const [translations, setTranslations] = useState<TranslationEntry[]>(initialTranslations);
  const [search, setSearch] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isSyncing, startSyncTransition] = useTransition();
  const locale = useLocale();
  
  // New translation state
  const [newKey, setNewKey] = useState("");
  const [newNamespace, setNewNamespace] = useState("");
  const [newVi, setNewVi] = useState("");
  const [newEn, setNewEn] = useState("");

  // Edit state
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");

  const router = useRouter();

  // Extract unique namespaces for filter tabs
  const namespaces = Array.from(new Set(translations.map(t => t.namespace || t.key.split('.')[0] || 'common'))).sort();

  const filtered = translations.filter(t => {
    const ns = t.namespace || t.key.split('.')[0] || 'common';
    const matchesNs = selectedNamespace === "all" || ns === selectedNamespace;
    const matchesSearch = 
      t.key.toLowerCase().includes(search.toLowerCase()) || 
      t.vi.toLowerCase().includes(search.toLowerCase()) ||
      t.en.toLowerCase().includes(search.toLowerCase());
    return matchesNs && matchesSearch;
  });

  async function handleAdd() {
    if (!newKey || !newNamespace || (!newVi && !newEn)) {
      toast.warning(locale === "vi" ? "Vui lòng điền đầy đủ thông tin" : "Please fill in all fields", locale === "vi" ? "Mã khóa, nhóm và ít nhất 1 nội dung dịch." : "Key, namespace and at least one translation.");
      return;
    }
    const res = await addTranslationAction(newKey, newNamespace, newVi, newEn);
    if (res.success) {
      setTranslations(prev => [...prev, { key: newKey, namespace: newNamespace, vi: newVi, en: newEn }]);
      setAdding(false);
      setNewKey("");
      setNewNamespace("");
      setNewVi("");
      setNewEn("");
      toast.success(locale === "vi" ? "Thêm khóa dịch thành công!" : "Translation key added successfully!", `"${newKey}"`);
      router.refresh();
    } else {
      toast.error(locale === "vi" ? "Thêm khóa thất bại" : "Failed to add key", res.error || (locale === "vi" ? "Vui lòng thử lại sau." : "Please try again."));
    }
  }

  async function handleSaveEdit(key: string) {
    const res = await updateTranslationAction(key, editVi, editEn);
    if (res.success) {
      setTranslations(prev => prev.map(t => t.key === key ? { ...t, vi: editVi, en: editEn } : t));
      setEditingKey(null);
      toast.success(locale === "vi" ? "Lưu bản dịch thành công!" : "Translation saved successfully!", `"${key}"`);
      router.refresh();
    } else {
      toast.error(locale === "vi" ? "Cập nhật thất bại" : "Update failed", res.error || (locale === "vi" ? "Không thể lưu thay đổi." : "Could not save changes."));
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(locale === "vi" ? `Bạn có chắc chắn muốn xóa bản dịch cho khóa: ${key}?` : `Are you sure you want to delete translation for key: ${key}?`)) return;
    const res = await deleteTranslationAction(key);
    if (res.success) {
      setTranslations(prev => prev.filter(t => t.key !== key));
      toast.info(locale === "vi" ? "Đã xóa khóa bản dịch" : "Translation key removed", `"${key}"`);
      router.refresh();
    } else {
      toast.error(locale === "vi" ? "Xóa thất bại" : "Delete failed", res.error || (locale === "vi" ? "Không thể xóa bản dịch." : "Could not delete translation."));
    }
  }

  function handleSyncAll() {
    startSyncTransition(async () => {
      const res = await syncAllTranslationsAction();
      if (res.success) {
        toast.success(locale === "vi" ? "Đồng bộ từ điển hoàn tất!" : "Dictionary sync complete!", locale === "vi" ? `Đã nạp ${res.count} từ khóa vào hệ thống cơ sở dữ liệu.` : `Loaded ${res.count} keys into database.`);
        router.refresh();
      } else {
        toast.error(locale === "vi" ? "Lỗi khi đồng bộ từ điển" : "Sync error", res.error || (locale === "vi" ? "Vui lòng thử lại sau." : "Please try again."));
      }
    });
  }

  function startEdit(t: TranslationEntry) {
    setEditingKey(t.key);
    setEditVi(t.vi);
    setEditEn(t.en);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls: Search + Sync Button + Add Key */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={locale === "vi" ? "Tìm kiếm theo mã key (ví dụ: home.hero.title1, nav.home) hoặc nội dung..." : "Search by key (e.g. home.hero.title1, nav.home) or text..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
            title={locale === "vi" ? "Đồng bộ toàn bộ từ khóa từ file từ điển tĩnh vào cơ sở dữ liệu để chỉnh sửa trực tiếp" : "Sync dictionary from static files into database"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary-light' : ''}`} />
            <span>{isSyncing ? (locale === "vi" ? "Đang đồng bộ..." : "Syncing...") : (locale === "vi" ? "Đồng bộ từ điển" : "Sync Dictionary")}</span>
          </button>

          <button 
            onClick={() => setAdding(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-xs transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> 
            <span>{locale === "vi" ? "Thêm Key mới" : "Add Key"}</span>
          </button>
        </div>
      </div>

      {/* Namespace Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
          <Layers size={14} /> {locale === "vi" ? "Nhóm:" : "Namespace:"}
        </span>
        <button
          onClick={() => setSelectedNamespace("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            selectedNamespace === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {locale === "vi" ? "Tất cả" : "All"} ({translations.length})
        </button>
        {namespaces.map(ns => (
          <button
            key={ns}
            onClick={() => setSelectedNamespace(ns)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedNamespace === ns
                ? "bg-primary text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {ns}
          </button>
        ))}
      </div>

      {/* Translations Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs font-medium text-slate-500">
                <th className="px-6 py-3.5 w-1/4">{locale === "vi" ? "MÃ KHÓA (KEY)" : "KEY"}</th>
                <th className="px-4 py-3.5 w-[12.5%]">{locale === "vi" ? "NHÓM" : "NAMESPACE"}</th>
                <th className="px-4 py-3.5 w-1/3">{locale === "vi" ? "TIẾNG VIỆT (VI)" : "VIETNAMESE (VI)"}</th>
                <th className="px-4 py-3.5 w-1/3">{locale === "vi" ? "TIẾNG ANH (EN)" : "ENGLISH (EN)"}</th>
                <th className="px-6 py-3.5 text-right">{locale === "vi" ? "THAO TÁC" : "ACTIONS"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {adding && (
                <tr className="border-b border-slate-100 bg-primary/5">
                  <td className="px-6 py-4">
                    <input autoFocus placeholder="e.g. home.hero.title1" className="w-full p-2 text-xs font-mono border border-slate-200 rounded-xl bg-white outline-none focus:border-primary" value={newKey} onChange={e => setNewKey(e.target.value)} />
                  </td>
                  <td className="px-4 py-4">
                    <input placeholder="e.g. home" className="w-full p-2 text-xs font-normal border border-slate-200 rounded-xl bg-white outline-none focus:border-primary" value={newNamespace} onChange={e => setNewNamespace(e.target.value)} />
                  </td>
                  <td className="px-4 py-4">
                    <textarea rows={2} placeholder={locale === "vi" ? "Nội dung Tiếng Việt..." : "Vietnamese text..."} className="w-full p-2 text-xs font-normal border border-slate-200 rounded-xl bg-white outline-none focus:border-primary resize-none" value={newVi} onChange={e => setNewVi(e.target.value)} />
                  </td>
                  <td className="px-4 py-4">
                    <textarea rows={2} placeholder="English content..." className="w-full p-2 text-xs font-normal border border-slate-200 rounded-xl bg-white outline-none focus:border-primary resize-none" value={newEn} onChange={e => setNewEn(e.target.value)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={handleAdd} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 cursor-pointer" title="Save"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setAdding(false)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer" title="Cancel"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}
              
              {filtered.length === 0 && !adding ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-medium text-xs font-sans text-slate-700">{locale === "vi" ? "Không tìm thấy từ khóa dịch nào phù hợp." : "No matching translations found."}</p>
                    <p className="text-xs mt-1 text-slate-400 font-normal">{locale === "vi" ? "Hãy thử nhấn nút 'Đồng bộ từ điển' ở trên để nạp toàn bộ từ khóa vào hệ thống." : "Try clicking 'Sync Dictionary' above to populate keys."}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-900 break-all">{t.key}</td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full uppercase font-mono">
                        {t.namespace || t.key.split('.')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-normal text-slate-700">
                      {editingKey === t.key ? (
                        <textarea 
                          rows={2}
                          className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:border-primary resize-none" 
                          value={editVi} 
                          onChange={e => setEditVi(e.target.value)} 
                        />
                      ) : (
                        <div className="line-clamp-2">{t.vi}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs font-normal text-slate-600">
                      {editingKey === t.key ? (
                        <textarea 
                          rows={2}
                          className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:border-primary resize-none" 
                          value={editEn} 
                          onChange={e => setEditEn(e.target.value)} 
                        />
                      ) : (
                        <div className="line-clamp-2">{t.en}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingKey === t.key ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSaveEdit(t.key)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 cursor-pointer" title="Lưu thay đổi"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingKey(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer" title="Hủy"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(t)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer" title="Chỉnh sửa">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(t.key)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

