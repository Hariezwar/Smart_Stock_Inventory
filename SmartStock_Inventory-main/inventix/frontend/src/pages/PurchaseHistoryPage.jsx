import React, { useEffect, useMemo, useState } from 'react';
import * as purchaseHistoryService from '../services/purchaseHistoryService';
import * as productService from '../services/productService';
import * as supplierService from '../services/supplierService';
import { Loader2, Plus, X, ClipboardList, ShoppingBag } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { useToast } from '../context/ToastContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
const EMPTY_FORM = { product_id: '', supplier_id: '', quantity: '', cost: '' };
const CHART_SERIES = ['#0A1931', '#1A3D63', '#2F5F8F', '#4A7FA7', '#6E9ABD', '#8FB4D0'];

function PurchaseModal({ open, onClose, onSave, products, suppliers }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  if (!open) return null;

  const change = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        product_id: Number(form.product_id),
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        quantity: Number(form.quantity),
        cost: Number(form.cost),
      });
      onClose();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to save purchase.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="surface-strong rounded-[2rem] w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[color:var(--line)]">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">Add Purchase Record</h3>
          <button onClick={onClose} className="text-[color:var(--muted)] hover:text-[color:var(--text)]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">Product</label>
            <select value={form.product_id} onChange={change('product_id')} className="input-shell w-full h-10 rounded-xl px-3 text-sm">
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">Supplier</label>
            <select value={form.supplier_id} onChange={change('supplier_id')} className="input-shell w-full h-10 rounded-xl px-3 text-sm">
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">Quantity</label>
              <input value={form.quantity} onChange={change('quantity')} type="number" className="input-shell w-full h-10 rounded-xl px-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--muted)] mb-1">Cost</label>
              <input value={form.cost} onChange={change('cost')} type="number" step="0.01" className="input-shell w-full h-10 rounded-xl px-3 text-sm" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary px-4 py-2 rounded-xl text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !form.product_id || !form.quantity || !form.cost} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseHistoryPage() {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyRes, productRes, supplierRes] = await Promise.all([
        purchaseHistoryService.getPurchaseHistory(),
        productService.getProducts(),
        supplierService.getSuppliers(),
      ]);
      setHistory(
        [...historyRes.data].sort(
          (a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)
        )
      );
      setProducts(productRes.data);
      setSuppliers(supplierRes.data);
    } catch {
      toast('Failed to load purchase history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const productMap = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), [products]);
  const supplierMap = useMemo(() => Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier])), [suppliers]);

  const supplierSpend = useMemo(() => {
    const totals = {};
    history.forEach((entry) => {
      const name = supplierMap[entry.supplier_id]?.name || 'Unassigned';
      totals[name] = (totals[name] || 0) + Number(entry.cost || 0);
    });
    return totals;
  }, [history, supplierMap]);

  const monthlyVolume = useMemo(() => {
    const totals = {};
    history.forEach((entry) => {
      const key = new Date(entry.purchase_date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      totals[key] = (totals[key] || 0) + Number(entry.quantity || 0);
    });
    return totals;
  }, [history]);

  const totalSpend = history.reduce((sum, entry) => sum + Number(entry.cost || 0), 0);
  const totalUnits = history.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);

  const pieData = {
    labels: Object.keys(supplierSpend),
    datasets: [{
      data: Object.values(supplierSpend),
      backgroundColor: CHART_SERIES,
      borderWidth: 0,
    }],
  };

  const lineData = {
    labels: Object.keys(monthlyVolume),
    datasets: [{
      label: 'Purchased units',
      data: Object.values(monthlyVolume),
      borderColor: '#1A3D63',
      backgroundColor: 'rgba(74, 127, 167, 0.16)',
      fill: true,
      pointBackgroundColor: '#0A1931',
      pointHoverBackgroundColor: '#4A7FA7',
      tension: 0.35,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8b8176', usePointStyle: true, boxWidth: 8 },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8b8176' } },
      y: { grid: { color: 'rgba(110, 83, 54, 0.12)' }, ticks: { color: '#8b8176' } },
    },
  };

  const handleSave = async (payload) => {
    await purchaseHistoryService.createPurchaseHistory(payload);
    toast('Purchase history updated.', 'success');
    await loadData();
  };

  return (
    <div className="space-y-6">
      <PurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} products={products} suppliers={suppliers} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Procurement</div>
          <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)]">Purchase History</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Track inbound stock, vendor spend, and recent procurement activity.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Purchase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="surface rounded-[1.75rem] p-5">
          <div className="eyebrow">Records</div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-3xl font-bold text-[color:var(--text)]">{history.length}</div>
            <ClipboardList className="w-5 h-5 text-[#1A3D63]" />
          </div>
        </div>
        <div className="surface rounded-[1.75rem] p-5">
          <div className="eyebrow">Units Purchased</div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-3xl font-bold text-[color:var(--text)]">{totalUnits}</div>
            <ShoppingBag className="w-5 h-5 text-[#1A3D63]" />
          </div>
        </div>
        <div className="surface rounded-[1.75rem] p-5">
          <div className="eyebrow">Total Spend</div>
          <div className="mt-3 text-3xl font-bold text-[color:var(--text)]">${totalSpend.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="surface rounded-[2rem] p-6 h-[360px]">
          <div className="eyebrow">Supplier Mix</div>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--text)]">Spend by supplier</h2>
          <div className="mt-6 h-[250px]">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8b8176', usePointStyle: true, boxWidth: 8 } } } }} />
          </div>
        </div>
        <div className="surface rounded-[2rem] p-6 h-[360px]">
          <div className="eyebrow">Flow</div>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--text)]">Monthly purchase volume</h2>
          <div className="mt-6 h-[250px]">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="surface rounded-[2rem] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-56"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/30 dark:bg-white/5 text-[color:var(--muted)] text-xs font-semibold uppercase">
                <tr>
                  {['Product', 'Supplier', 'Quantity', 'Cost', 'Date'].map((label) => <th key={label} className="px-5 py-3.5">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)] text-[color:var(--text)]">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{productMap[entry.product_id]?.name || `Product #${entry.product_id}`}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)]">{supplierMap[entry.supplier_id]?.name || 'Unassigned'}</td>
                    <td className="px-5 py-3.5">{entry.quantity}</td>
                    <td className="px-5 py-3.5">${Number(entry.cost).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-[color:var(--muted)]">{new Date(entry.purchase_date).toLocaleString()}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-[color:var(--muted)]">No purchase history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
