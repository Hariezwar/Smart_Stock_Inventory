import React, { useEffect, useState } from 'react';
import * as dashboardService from '../services/dashboardService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, AlertTriangle, Package, DollarSign, Loader2 } from 'lucide-react';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_SERIES = ['#0A1931', '#1A3D63', '#2F5F8F', '#4A7FA7', '#6E9ABD', '#8FB4D0'];
const DONUT_SERIES = ['#0A1931', '#1A3D63', '#4A7FA7', '#8FB4D0'];

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

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#8b8176', usePointStyle: true, boxWidth: 8 },
    },
  },
  cutout: '74%',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  const kpiData = [
    { title: 'Total SKUs', value: stats?.total_skus ?? 0, growth: 'Live', icon: Package, tone: 'bg-[#1a3d63] text-[#f6fafd] dark:bg-[#1a3d63]/70 dark:text-[#f6fafd]' },
    { title: 'Stock Value', value: `$${Number(stats?.total_value ?? 0).toLocaleString()}`, growth: 'Portfolio', icon: DollarSign, tone: 'bg-[#4a7fa7] text-[#f6fafd] dark:bg-[#4a7fa7]/45 dark:text-[#f6fafd]' },
    { title: 'Turnover Rate', value: stats?.turnover_rate ?? '0x', growth: 'Velocity', icon: TrendingUp, tone: 'bg-[#1a3d63] text-[#f6fafd] dark:bg-[#0a1931] dark:text-[#f6fafd]' },
    { title: 'Low Stock Alerts', value: stats?.low_stock_alerts ?? 0, growth: 'Action', icon: AlertTriangle, tone: 'bg-[#0a1931] text-[#f6fafd] dark:bg-[#081225] dark:text-[#f6fafd]' },
  ];

  const barChartData = {
    labels: stats?.category_chart?.labels || [],
    datasets: [
      {
        label: 'Stock by Category',
        data: stats?.category_chart?.data || [],
        backgroundColor: CHART_SERIES,
        borderRadius: 12,
      },
    ],
  };

  const donutChartData = {
    labels: stats?.status_chart?.labels || [],
    datasets: [
      {
        data: stats?.status_chart?.data || [],
        backgroundColor: DONUT_SERIES,
        borderWidth: 0,
      },
    ],
  };

  const lineChartData = {
    labels: stats?.trend_chart?.labels?.length ? stats.trend_chart.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Purchase movement',
        data: stats?.trend_chart?.data?.length ? stats.trend_chart.data : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#1A3D63',
        backgroundColor: 'rgba(74, 127, 167, 0.16)',
        fill: true,
        tension: 0.38,
        pointRadius: 4,
        pointBackgroundColor: '#0A1931',
        pointHoverBackgroundColor: '#4A7FA7',
      },
    ],
  };

  return (
    <div className="space-y-6">

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="surface rounded-[1.75rem] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow">{kpi.title}</div>
                  <div className="mt-3 text-3xl font-bold text-[color:var(--text)]">{kpi.value}</div>
                  <div className="mt-2 text-sm text-[color:var(--muted)]">{kpi.growth}</div>
                </div>
                <div className={`rounded-2xl p-3 ${kpi.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="surface rounded-[2rem] p-6 xl:col-span-2 h-[390px]">
          <div className="eyebrow">Movement</div>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--text)]">Purchase trend</h2>
          <div className="mt-6 h-[280px]">
            <Line options={chartOptions} data={lineChartData} />
          </div>
        </div>
        <div className="surface rounded-[2rem] p-6 h-[390px]">
          <div className="eyebrow">Health Mix</div>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--text)]">Inventory status</h2>
          <div className="relative mt-5 h-[280px]">
            <Doughnut options={donutOptions} data={donutChartData} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-[color:var(--text)]">{stats?.total_skus ?? 0}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">Tracked SKUs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface rounded-[2rem] p-6 h-[360px]">
        <div className="eyebrow">Spread</div>
        <h2 className="mt-2 text-xl font-bold text-[color:var(--text)]">Stock by category</h2>
        <div className="mt-6 h-[255px]">
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </section>
    </div>
  );
}
