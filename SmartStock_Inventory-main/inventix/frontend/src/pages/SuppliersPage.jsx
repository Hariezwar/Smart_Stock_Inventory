import React, { useState, useEffect } from 'react';
import * as supplierService from '../services/supplierService';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
const EMPTY = { name: '', email: '', phone: '', address: '' };

function SupplierModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => setForm(initial || EMPTY), [initial]);

  const change = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Save failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="surface-strong rounded-[2rem] w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-[color:var(--line)]">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">{initial?.id ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={onClose} className="text-[color:var(--muted)] hover:text-[color:var(--text)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[['Company Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Address', 'address']].map(([label, field]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">{label}</label>
              <input value={form[field] ?? ''} onChange={change(field)} className="input-shell w-full h-10 px-3 rounded-xl text-sm" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm rounded-xl">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary px-4 py-2 text-sm rounded-xl font-medium disabled:opacity-60 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial?.id ? 'Save Changes' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await supplierService.getSuppliers();
      setSuppliers(r.data);
    } catch {
      toast('Failed to load suppliers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (form) => {
    if (editItem?.id) {
      await supplierService.updateSupplier(editItem.id, form);
      toast('Supplier updated!', 'success');
    } else {
      await supplierService.createSupplier(form);
      toast('Supplier added!', 'success');
    }
    fetchData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"? This will also unlink their products.`)) return;
    try {
      await supplierService.deleteSupplier(id);
      toast(`Supplier "${name}" deleted.`, 'success');
      fetchData();
    } catch {
      toast('Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <SupplierModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSave={handleSave} initial={editItem} />
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Partners</div>
          <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)]">Suppliers</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{suppliers.length} active suppliers</p>
        </div>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium shadow-[0_12px_24px_rgba(194,109,50,0.18)]">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="surface rounded-[2rem] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/30 dark:bg-white/5 text-[color:var(--muted)] text-xs font-semibold uppercase">
                <tr>
                  {['Supplier', 'Email', 'Phone', 'Address', 'Actions'].map((h) => <th key={h} className="px-5 py-3.5">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)] text-[color:var(--text)]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)]">{s.email}</td>
                    <td className="px-5 py-3.5">{s.phone}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)] max-w-[200px] truncate">{s.address}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditItem(s); setModalOpen(true); }} className="p-1.5 text-[color:var(--muted)] hover:text-[#1A3D63] transition-colors rounded-md hover:bg-[#F6FAFD] dark:hover:bg-primary-900/20">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-[color:var(--muted)] hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-[color:var(--muted)]">No suppliers yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
