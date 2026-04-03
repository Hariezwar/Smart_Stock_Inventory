import React, { useState, useEffect } from 'react';
import * as dashboardService from '../services/dashboardService';
import { Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
const CHART_SERIES = ['#0A1931', '#1A3D63', '#2F5F8F', '#4A7FA7', '#6E9ABD'];
const DONUT_SERIES = ['#0A1931', '#1A3D63', '#4A7FA7', '#8FB4D0'];

const chartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#8b8176', font: { size: 12 }, usePointStyle: true } },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8b8176' } },
    y: { grid: { color: 'rgba(110, 83, 54, 0.12)' }, ticks: { color: '#8b8176' } },
  },
});

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  const barData = {
    labels: stats?.category_chart?.labels || [],
    datasets: [{ label: 'Units in Stock', data: stats?.category_chart?.data || [], backgroundColor: CHART_SERIES, borderRadius: 10 }],
  };

  const donutData = {
    labels: stats?.status_chart?.labels || [],
    datasets: [{ data: stats?.status_chart?.data || [], backgroundColor: DONUT_SERIES, borderWidth: 0, hoverOffset: 4 }],
  };

  const lineData = {
    labels: stats?.trend_chart?.labels?.length ? stats.trend_chart.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Units Purchased',
      data: stats?.trend_chart?.data?.length ? stats.trend_chart.data : [800, 950, 700, 1100, 900, 1250, 1050],
      borderColor: '#1A3D63',
      backgroundColor: 'rgba(74, 127, 167, 0.16)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#0A1931',
      pointHoverBackgroundColor: '#4A7FA7',
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Signals</div>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)]">Analytics</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Visual breakdown of inventory performance and purchasing momentum.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface rounded-[2rem] p-6 h-72">
          <h3 className="text-base font-semibold text-[color:var(--text)] mb-4">Stock by Category</h3>
          <div className="h-52"><Bar data={barData} options={chartOptions()} /></div>
        </div>
        <div className="surface rounded-[2rem] p-6 h-72 flex flex-col">
          <h3 className="text-base font-semibold text-[color:var(--text)] mb-4">Inventory Status Distribution</h3>
          <div className="flex-1 flex items-center justify-center"><Doughnut data={donutData} options={{ ...chartOptions(), cutout: '72%', scales: undefined }} /></div>
        </div>
      </div>

      <div className="surface rounded-[2rem] p-6 h-80">
        <h3 className="text-base font-semibold text-[color:var(--text)] mb-4">Purchase Volume Trend</h3>
        <div className="h-60"><Line data={lineData} options={chartOptions()} /></div>
      </div>
    </div>
  );
}
