"use client";

import { useState, useTransition } from 'react';
import { TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { Edit3, Plus, Trash2, Search, Check, X, RefreshCw, Layers } from 'lucide-react';
import { addTranslationAction, updateTranslationAction, deleteTranslationAction, syncAllTranslationsAction } from '@/presentation/actions/i18n';
import { useRouter } from 'next/navigation';
import { toast } from '@/presentation/hooks/useToastStore';
import React from 'react';

export default function TranslationTableClient({ initialTranslations }: { initialTranslations: TranslationEntry[] }): React.ReactElement {
  const [translations, setTranslations] = useState<TranslationEntry[]>(initialTranslations);
  const [search, setSearch] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isSyncing, startSyncTransition] = useTransition();
  
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
      toast.warning("Vui lòng điền đầy đủ thông tin", "Mã khóa, nhóm và ít nhất 1 nội dung dịch.");
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
      toast.success("Thêm khóa dịch thành công!", `Đã thêm: "${newKey}"`);
      router.refresh();
    } else {
      toast.error("Thêm khóa thất bại", res.error || "Vui lòng thử lại sau.");
    }
  }

  async function handleSaveEdit(key: string) {
    const res = await updateTranslationAction(key, editVi, editEn);
    if (res.success) {
      setTranslations(prev => prev.map(t => t.key === key ? { ...t, vi: editVi, en: editEn } : t));
      setEditingKey(null);
      toast.success("Lưu bản dịch thành công!", `Đã cập nhật: "${key}"`);
      router.refresh();
    } else {
      toast.error("Cập nhật thất bại", res.error || "Không thể lưu thay đổi.");
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa bản dịch cho khóa: ${key}?`)) return;
    const res = await deleteTranslationAction(key);
    if (res.success) {
      setTranslations(prev => prev.filter(t => t.key !== key));
      toast.info("Đã xóa khóa bản dịch", `Khóa "${key}" đã được gỡ bỏ khỏi CSDL.`);
      router.refresh();
    } else {
      toast.error("Xóa thất bại", res.error || "Không thể xóa bản dịch.");
    }
  }

  function handleSyncAll() {
    startSyncTransition(async () => {
      const res = await syncAllTranslationsAction();
      if (res.success) {
        toast.success("Đồng bộ từ điển hoàn tất!", `Đã nạp ${res.count} từ khóa vào hệ thống cơ sở dữ liệu.`);
        router.refresh();
      } else {
        toast.error("Lỗi khi đồng bộ từ điển", res.error || "Vui lòng thử lại sau.");
      }
    });
  }

  function startEdit(t: TranslationEntry) {
    setEditingKey(t.key);
    setEditVi(t.vi);
    setEditEn(t.en);
  }

  return (
    <div className="space-y-6 font-manrope">
      {/* Top Controls: Search + Sync Button + Add Key */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã key (ví dụ: home.hero.title1, nav.home) hoặc nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] text-xs font-medium shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
            title="Đồng bộ toàn bộ từ khóa từ file từ điển tĩnh vào cơ sở dữ liệu để chỉnh sửa trực tiếp"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ từ điển"}</span>
          </button>

          <button 
            onClick={() => setAdding(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0051d5] hover:bg-[#0041ac] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-900/10 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Thêm Key mới
          </button>
        </div>
      </div>

      {/* Namespace Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Layers size={14} /> Nhóm:
        </span>
        <button
          onClick={() => setSelectedNamespace("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedNamespace === "all"
              ? "bg-[#0051d5] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả ({translations.length})
        </button>
        {namespaces.map(ns => (
          <button
            key={ns}
            onClick={() => setSelectedNamespace(ns)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedNamespace === ns
                ? "bg-[#0051d5] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {ns}
          </button>
        ))}
      </div>

      {/* Translations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider w-1/4">Key (Mã tham chiếu)</th>
                <th className="px-4 py-4 font-bold text-[10px] uppercase tracking-wider w-1/8">Nhóm</th>
                <th className="px-4 py-4 font-bold text-[10px] uppercase tracking-wider w-1/3">Tiếng Việt (VI)</th>
                <th className="px-4 py-4 font-bold text-[10px] uppercase tracking-wider w-1/3">English (EN)</th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {adding && (
                <tr className="border-b border-slate-200 bg-blue-50/40">
                  <td className="px-6 py-4">
                    <input autoFocus placeholder="e.g. home.hero.title1" className="w-full p-2 text-xs font-mono border border-slate-300 rounded-lg bg-white outline-none focus:border-[#0051d5]" value={newKey} onChange={e => setNewKey(e.target.value)} />
                  </td>
                  <td className="px-4 py-4">
                    <input placeholder="e.g. home" className="w-full p-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:border-[#0051d5]" value={newNamespace} onChange={e => setNewNamespace(e.target.value)} />
                  </td>
                  <td className="px-4 py-4">
                    <textarea rows={2} placeholder="Nội dung Tiếng Việt..." className="w-full p-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:border-[#0051d5] resize-none" value={newVi} onChange={e => setNewVi(e.target.value)} />
                  </td>
                  <td className="px-4 py-4">
                    <textarea rows={2} placeholder="English content..." className="w-full p-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none focus:border-[#0051d5] resize-none" value={newEn} onChange={e => setNewEn(e.target.value)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={handleAdd} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 cursor-pointer font-bold" title="Save"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setAdding(false)} className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 cursor-pointer font-bold" title="Cancel"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}
              
              {filtered.length === 0 && !adding ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-bold text-sm font-playfair text-slate-700">Không tìm thấy từ khóa dịch nào phù hợp.</p>
                    <p className="text-xs mt-1">Hãy thử nhấn nút <strong>&quot;Đồng bộ từ điển&quot;</strong> ở trên để nạp toàn bộ từ khóa vào hệ thống.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.key} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800 break-all">{t.key}</td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {t.namespace || t.key.split('.')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-800">
                      {editingKey === t.key ? (
                        <textarea 
                          rows={2}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-[#0051d5] resize-none" 
                          value={editVi} 
                          onChange={e => setEditVi(e.target.value)} 
                        />
                      ) : (
                        <div className="line-clamp-2">{t.vi}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-600">
                      {editingKey === t.key ? (
                        <textarea 
                          rows={2}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs outline-none focus:border-[#0051d5] resize-none" 
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
                          <button onClick={() => handleSaveEdit(t.key)} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500/20 cursor-pointer" title="Lưu thay đổi"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingKey(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer" title="Hủy"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(t)} className="p-2 bg-[#0051d5]/10 text-[#0051d5] rounded-lg hover:bg-[#0051d5]/20 transition-colors cursor-pointer" title="Chỉnh sửa">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(t.key)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors cursor-pointer" title="Xóa">
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
