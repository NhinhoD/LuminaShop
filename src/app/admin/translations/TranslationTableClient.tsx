"use client";

import { useState } from 'react';
import { TranslationEntry } from '@/domain/repositories/ITranslationRepository';
import { Edit3, Plus, Trash2, Search, Check, X } from 'lucide-react';
import { addTranslationAction, updateTranslationAction, deleteTranslationAction } from '@/presentation/actions/i18n';
import { useRouter } from 'next/navigation';

import React from 'react';

export default function TranslationTableClient({ initialTranslations }: { initialTranslations: TranslationEntry[] }): React.ReactElement {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New translation state
  const [newKey, setNewKey] = useState("");
  const [newNamespace, setNewNamespace] = useState("");
  const [newVi, setNewVi] = useState("");
  const [newEn, setNewEn] = useState("");

  // Edit state
  const [editVi, setEditVi] = useState("");
  const [editEn, setEditEn] = useState("");

  const router = useRouter();

  const filtered = initialTranslations.filter(t => 
    t.key.toLowerCase().includes(search.toLowerCase()) || 
    t.namespace.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd() {
    if (!newKey || !newNamespace || (!newVi && !newEn)) return;
    const res = await addTranslationAction(newKey, newNamespace, newVi, newEn);
    if (res.success) {
      setAdding(false);
      setNewKey("");
      setNewNamespace("");
      setNewVi("");
      setNewEn("");
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to add translation');
    }
  }

  async function handleSaveEdit(key: string) {
    const res = await updateTranslationAction(key, editVi, editEn);
    if (res.success) {
      setEditingKey(null);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to update translation');
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Are you sure you want to delete the translation for key: ${key}?`)) return;
    const res = await deleteTranslationAction(key);
    if (res.success) {
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to delete translation');
    }
  }

  function startEdit(t: TranslationEntry) {
    setEditingKey(t.key);
    setEditVi(t.vi);
    setEditEn(t.en);
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex justify-between items-center text-sm">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-md"><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex gap-4 items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/50" />
          <input 
            type="text" 
            placeholder="Search by key or namespace..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container border border-outline-variant focus:outline-none focus:border-primary text-sm"
          />
        </div>
        <button 
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Key
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container/50 border-b border-outline-variant">
              <th className="px-6 py-4 font-semibold text-sm w-1/4">Key</th>
              <th className="px-4 py-4 font-semibold text-sm w-1/6">Namespace</th>
              <th className="px-4 py-4 font-semibold text-sm w-1/4">English (EN)</th>
              <th className="px-4 py-4 font-semibold text-sm w-1/4">Vietnamese (VI)</th>
              <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr className="border-b border-outline-variant/50 bg-primary/5">
                <td className="px-6 py-4">
                  <input autoFocus placeholder="e.g. nav.home" className="w-full p-2 text-xs font-mono border rounded" value={newKey} onChange={e => setNewKey(e.target.value)} />
                </td>
                <td className="px-4 py-4">
                  <input placeholder="e.g. nav" className="w-full p-2 text-sm border rounded" value={newNamespace} onChange={e => setNewNamespace(e.target.value)} />
                </td>
                <td className="px-4 py-4">
                  <input placeholder="English text" className="w-full p-2 text-sm border rounded" value={newEn} onChange={e => setNewEn(e.target.value)} />
                </td>
                <td className="px-4 py-4">
                  <input placeholder="Vietnamese text" className="w-full p-2 text-sm border rounded" value={newVi} onChange={e => setNewVi(e.target.value)} />
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button onClick={handleAdd} className="p-1.5 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setAdding(false)} className="p-1.5 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            
            {filtered.length === 0 && !adding ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface/60">
                  No translations found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.key} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface/70">{t.key}</td>
                  <td className="px-4 py-4 text-sm text-on-surface/70">{t.namespace}</td>
                  <td className="px-4 py-4 text-sm">
                    {editingKey === t.key ? (
                      <input className="w-full p-1.5 border rounded text-sm" value={editEn} onChange={e => setEditEn(e.target.value)} />
                    ) : t.en}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {editingKey === t.key ? (
                      <input className="w-full p-1.5 border rounded text-sm" value={editVi} onChange={e => setEditVi(e.target.value)} />
                    ) : t.vi}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingKey === t.key ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleSaveEdit(t.key)} className="p-1.5 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingKey(null)} className="p-1.5 bg-gray-500/10 text-gray-600 rounded hover:bg-gray-500/20"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(t)} className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.key)} className="p-1.5 bg-error/10 text-error rounded hover:bg-error/20 transition-colors" title="Delete">
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
  );
}
