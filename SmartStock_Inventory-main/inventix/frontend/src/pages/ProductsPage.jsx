import React, { useState, useEffect } from 'react';
import * as productService from '../services/productService';
import * as supplierService from '../services/supplierService';
import { Plus, Edit2, Trash2, Search, X, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';
const STATUS_COLORS = {
  Optimal: 'bg-[#1a3d63] text-[#f6fafd] dark:bg-[#1a3d63]/80 dark:text-[#f6fafd]',
  'Low Stock': 'bg-[#4a7fa7] text-[#f6fafd] dark:bg-[#4a7fa7]/70 dark:text-[#f6fafd]',
  Critical: 'bg-[#0a1931] text-[#f6fafd] dark:bg-[#081225] dark:text-[#f6fafd]',
  Overstock: 'bg-[#4a7fa7] text-[#f6fafd] dark:bg-[#1a3d63] dark:text-[#f6fafd]',
};

const EMPTY_FORM = { name: '', sku: '', category: '', unit_price: '', cost_price: '', stock: '', reorder_level: '', optimal_level: '', status: 'Optimal', supplier_id: '' };

function ProductModal({ open, onClose, onSave, initial, suppliers }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', phone: '', address: '' });
  const { toast } = useToast();

  useEffect(() => {
    setForm(initial || EMPTY_FORM);
    setIsAddingSupplier(false);
    setSupplierForm({ name: '', email: '', phone: '', address: '' });
  }, [initial, open]);

  const change = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const changeSupplier = (f) => (e) => setSupplierForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isAddingSupplier && !supplierForm.name.trim()) {
        toast('Enter a supplier name to save it with the product.', 'error');
        setLoading(false);
        return;
      }
      const payload = {
        ...form,
        supplier_id: isAddingSupplier ? null : form.supplier_id,
        supplier: isAddingSupplier
          ? {
              name: supplierForm.name.trim(),
              email: supplierForm.email.trim().toLowerCase(),
              phone: supplierForm.phone.trim(),
              address: supplierForm.address.trim(),
            }
          : null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to save.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="surface-strong rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[color:var(--line)]">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">{initial?.id ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="text-[color:var(--muted)] hover:text-[color:var(--text)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Product Name', field: 'name', col: 2 },
            { label: 'SKU', field: 'sku' },
            { label: 'Category', field: 'category' },
            { label: 'Unit Price ($)', field: 'unit_price', type: 'number' },
            { label: 'Cost Price ($)', field: 'cost_price', type: 'number' },
            { label: 'Stock Qty', field: 'stock', type: 'number' },
            { label: 'Reorder Level', field: 'reorder_level', type: 'number' },
            { label: 'Optimal Level', field: 'optimal_level', type: 'number' },
          ].map(({ label, field, type = 'text', col }) => (
            <div key={field} className={col === 2 ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">{label}</label>
              <input type={type} value={form[field] ?? ''} onChange={change(field)} className="input-shell w-full h-10 px-3 rounded-xl text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">Status</label>
            <select value={form.status} onChange={change('status')} className="input-shell w-full h-10 px-3 rounded-xl text-sm">
              {['Optimal', 'Low Stock', 'Critical', 'Overstock'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[color:var(--muted)]">Supplier</label>
              <button type="button" onClick={() => setIsAddingSupplier(!isAddingSupplier)} className="text-xs text-[#1A3D63] hover:text-[#0A1931] font-medium">
                {isAddingSupplier ? 'Cancel New Supplier' : '+ Add New Supplier'}
              </button>
            </div>

            {isAddingSupplier ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 surface rounded-2xl">
                <p className="sm:col-span-2 text-xs text-[color:var(--muted)]">
                  This supplier will be created automatically when you save the product.
                </p>
                <input type="text" placeholder="Company Name *" required value={supplierForm.name} onChange={changeSupplier('name')} className="input-shell sm:col-span-2 h-10 px-3 rounded-xl text-sm" />
                <input type="email" placeholder="Email" value={supplierForm.email} onChange={changeSupplier('email')} className="input-shell h-10 px-3 rounded-xl text-sm" />
                <input type="text" placeholder="Phone" value={supplierForm.phone} onChange={changeSupplier('phone')} className="input-shell h-10 px-3 rounded-xl text-sm" />
                <input type="text" placeholder="Address" value={supplierForm.address} onChange={changeSupplier('address')} className="input-shell sm:col-span-2 h-10 px-3 rounded-xl text-sm" />
              </div>
            ) : (
              <select value={form.supplier_id ?? ''} onChange={change('supplier_id')} className="input-shell w-full h-10 px-3 rounded-xl text-sm">
                <option value="">No Supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm rounded-xl">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary px-4 py-2 text-sm rounded-xl font-medium disabled:opacity-60 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {initial?.id ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, supRes] = await Promise.all([
        productService.getProducts(),
        supplierService.getSuppliers(),
      ]);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
    } catch {
      toast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async (form) => {
    const payload = { ...form, unit_price: parseFloat(form.unit_price) || 0, cost_price: parseFloat(form.cost_price) || 0, stock: parseInt(form.stock) || 0, reorder_level: parseInt(form.reorder_level) || 0, optimal_level: parseInt(form.optimal_level) || 0, supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null };
    if (editItem?.id) {
      await productService.updateProduct(editItem.id, payload);
      toast('Product updated!', 'success');
    } else {
      await productService.createProduct(payload);
      toast('Product added!', 'success');
    }
    fetchData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      toast(`"${name}" deleted.`, 'success');
      fetchData();
    } catch {
      toast('Delete failed.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <ProductModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSave={handleSave} initial={editItem} suppliers={suppliers} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Catalog</div>
          <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)]">Products Inventory</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{products.length} products total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-secondary p-2 rounded-2xl text-[color:var(--muted)] hover:text-[#1A3D63] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium shadow-[0_12px_24px_rgba(194,109,50,0.18)]">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-shell h-11 pl-9 pr-4 rounded-2xl text-sm w-56 transition-all" placeholder="Search products..." />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['All', 'Optimal', 'Low Stock', 'Critical', 'Overstock'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-2xl text-xs font-medium transition-colors ${filterStatus === s ? 'bg-[#1A3D63] text-white' : 'btn-secondary text-[color:var(--muted)] hover:text-[#1A3D63]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="surface rounded-[2rem] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/30 dark:bg-white/5 text-[color:var(--muted)] text-xs font-semibold uppercase">
                <tr>
                  {['Product', 'SKU', 'Category', 'Supplier', 'Stock', 'Reorder', 'Status', 'Actions'].map((h) => <th key={h} className="px-5 py-3.5">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)] text-[color:var(--text)]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-medium max-w-[180px] truncate">{p.name}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)] font-mono text-xs">{p.sku}</td>
                    <td className="px-5 py-3.5">{p.category}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)]">{p.supplier?.name || '-'}</td>
                    <td className="px-5 py-3.5 font-bold">{p.stock}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)]">{p.reorder_level}</td>
                    <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditItem(p); setModalOpen(true); }} className="p-1.5 text-[color:var(--muted)] hover:text-[#1A3D63] transition-colors rounded-md hover:bg-[#F6FAFD] dark:hover:bg-primary-900/20"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-[color:var(--muted)] hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-[color:var(--muted)]">No products match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
