import React, { useState, useEffect } from 'react';
import * as alertService from '../services/alertService';
import { AlertTriangle, RefreshCw, Loader2, CheckCircle, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailingId, setEmailingId] = useState(null);
  const [orderingId, setOrderingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAlerts();
      setAlerts(res.data);
    } catch {
      toast('Failed to load alerts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const intervalId = window.setInterval(fetchAlerts, 30000);
    const handleFocus = () => fetchAlerts();

    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const sendEmailAlert = async (alert) => {
    setEmailingId(alert.product_id);
    try {
      const res = await alertService.emailAlert(alert.product_id);
      toast(res.data.message || `Email alert sent for "${alert.product_name}".`, 'success');
      await fetchAlerts();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to send alert email.', 'error');
    } finally {
      setEmailingId(null);
    }
  };

  const handleCreateOrder = async (alert) => {
    setOrderingId(alert.product_id);
    try {
      const res = await alertService.orderAlert(alert.product_id);
      toast(`Purchase order #${res.data.id} created and sent to ${alert.supplier_name || 'the supplier'}.`, 'success');
      await fetchAlerts();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to create purchase order.', 'error');
    } finally {
      setOrderingId(null);
    }
  };

  const dismissAlert = async (alert) => {
    setDeletingId(alert.product_id);
    try {
      const res = await alertService.dismissAlert(alert.product_id);
      toast(res.data.message || `Alert dismissed for "${alert.product_name}".`, 'success');
      await fetchAlerts();
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to dismiss alert.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Attention</div>
          <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)]">Alerts & Notifications</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{alerts.length} active alert{alerts.length !== 1 ? 's' : ''} require attention.</p>
        </div>
        <button onClick={fetchAlerts} className="btn-secondary p-2 rounded-2xl text-[color:var(--muted)] hover:text-[#1A3D63] transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
      ) : alerts.length === 0 ? (
        <div className="surface rounded-[2rem] p-12 text-center">
          <CheckCircle className="w-12 h-12 text-[#1A3D63] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[color:var(--text)]">All Clear</h3>
          <p className="text-sm mt-1 text-[color:var(--muted)]">All products are sufficiently stocked.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const orderUnavailable = !alert.supplier_email || alert.suggested_reorder <= 0;
            return (
            <div key={i} className={`p-5 rounded-[1.75rem] border flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm ${
              alert.severity === 'Critical'
                ? 'bg-[#f6fafd] border-[#4a7fa7]/30 dark:bg-[#1a3d63]/30 dark:border-[#4a7fa7]/40'
                : 'bg-[#f6fafd] border-[#4a7fa7]/24 dark:bg-[#10233f] dark:border-[#1a3d63]'
            }`}>
              <AlertTriangle className={`w-7 h-7 shrink-0 ${alert.severity === 'Critical' ? 'text-[#0A1931]' : 'text-[#1A3D63]'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${alert.severity === 'Critical' ? 'bg-[#0A1931] text-[#F6FAFD] dark:bg-[#081225] dark:text-[#F6FAFD]' : 'bg-[#1A3D63] text-[#F6FAFD] dark:bg-[#1A3D63] dark:text-[#F6FAFD]'}`}>
                    {alert.severity}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{alert.product_name}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                {alert.suggested_reorder > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Suggested reorder quantity: <strong className="text-slate-700 dark:text-slate-300">{alert.suggested_reorder} units</strong>
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Supplier: <strong className="text-slate-700 dark:text-slate-300">{alert.supplier_name || 'Not assigned'}</strong>
                  {alert.supplier_email ? ` (${alert.supplier_email})` : ''}
                </p>
                {orderUnavailable && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Assign a supplier email to enable purchase-order sending.
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0 items-start ml-auto">
                <button
                  onClick={() => sendEmailAlert(alert)}
                  disabled={emailingId === alert.product_id}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-current text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-dark-card transition-colors disabled:opacity-60"
                >
                  {emailingId === alert.product_id ? 'Sending...' : 'Email Alert'}
                </button>
                <button
                  onClick={() => handleCreateOrder(alert)}
                  disabled={orderingId === alert.product_id || orderUnavailable}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl text-white transition-colors disabled:opacity-60 ${alert.severity === 'Critical' ? 'bg-[#0A1931] hover:bg-[#081225]' : 'bg-[#1A3D63] hover:bg-[#0A1931]'}`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> {orderingId === alert.product_id ? 'Creating...' : 'Create Order'}
                </button>
                <button
                  onClick={() => dismissAlert(alert)}
                  disabled={deletingId === alert.product_id}
                  className="p-2 rounded-xl border border-current text-slate-400 hover:text-red-500 hover:bg-white/60 dark:hover:bg-dark-card transition-colors disabled:opacity-60"
                  aria-label={`Dismiss alert for ${alert.product_name}`}
                  title="Dismiss alert"
                >
                  {deletingId === alert.product_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="surface rounded-[2rem] p-6">
          <h3 className="font-semibold text-[color:var(--text)] mb-4">Smart Reorder Suggestions</h3>
          <div className="space-y-3">
            {alerts.filter((a) => a.suggested_reorder > 0).map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[color:var(--line)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[color:var(--text)]">{a.product_name}</p>
                  <p className="text-xs text-[color:var(--muted)]">Order {a.suggested_reorder} units to reach optimal level</p>
                </div>
                <button
                  onClick={() => handleCreateOrder(a)}
                  disabled={orderingId === a.product_id || !a.supplier_email || a.suggested_reorder <= 0}
                  className="btn-secondary text-xs font-medium px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {orderingId === a.product_id ? 'Creating...' : 'Order Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
