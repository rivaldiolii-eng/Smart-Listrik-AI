import React from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { CalculationResult, HouseProfile } from '../types';
import { BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';

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

interface ChartsSectionProps {
  calc: CalculationResult;
  profile: HouseProfile;
  darkMode: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ calc, profile, darkMode }) => {
  const textColor = darkMode ? '#f4f4f5' : '#1e293b';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // 1. Line Chart Data: 30-Day Daily Consumption Trend Forecast
  const days30Labels = Array.from({ length: 30 }, (_, i) => `H-${i + 1}`);
  const baseDailyKwh = calc.kwhPerDay;
  // Add small natural variance (+/- 10%)
  const dailyKwhSeries = days30Labels.map((_, i) => {
    const variance = (Math.sin(i * 0.5) * 0.15) + (Math.cos(i * 0.3) * 0.1);
    return Math.max(0.5, Number((baseDailyKwh * (1 + variance)).toFixed(2)));
  });

  const lineChartData = {
    labels: days30Labels,
    datasets: [
      {
        label: 'Estimasi Konsumsi Harian (kWh)',
        data: dailyKwhSeries,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } },
      },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  // 2. Bar Chart Data: Monthly Category Breakdown
  const categoryMap: Record<string, number> = {};
  calc.applianceBreakdown.forEach((item) => {
    const cat = item.appliance.category;
    categoryMap[cat] = (categoryMap[cat] || 0) + item.kwhMonth;
  });

  const categoryLabels = Object.keys(categoryMap);
  const categoryValues = Object.values(categoryMap).map((v) => Number(v.toFixed(1)));

  const barChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Belum Ada Alat'],
    datasets: [
      {
        label: 'Konsumsi per Kategori (kWh/bulan)',
        data: categoryValues.length > 0 ? categoryValues : [0],
        backgroundColor: [
          '#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#8b5cf6', '#64748b'
        ],
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } } },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  // 3. Doughnut Chart Data: Top Appliances Share
  const topBreakdown = calc.applianceBreakdown.slice(0, 6);
  const doughnutLabels = topBreakdown.map((item) => item.appliance.name);
  const doughnutData = topBreakdown.map((item) => Number(item.kwhMonth.toFixed(1)));

  const doughnutChartData = {
    labels: doughnutLabels.length > 0 ? doughnutLabels : ['Tidak ada data'],
    datasets: [
      {
        data: doughnutData.length > 0 ? doughnutData : [100],
        backgroundColor: [
          '#6366f1',
          '#3b82f6',
          '#f59e0b',
          '#10b981',
          '#ec4899',
          '#06b6d4',
        ],
        borderWidth: 2,
        borderColor: darkMode ? '#18181b' : '#ffffff',
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
    },
  };

  // 4. Cost Variation Chart: Estimasi Biaya per Bulan (Variasi Jam Pemakaian -10%, Normal, +10%)
  const costNormal = Math.round(calc.costPerMonth);
  const costMinus20 = Math.round(costNormal * 0.8);
  const costMinus10 = Math.round(costNormal * 0.9);
  const costPlus10 = Math.round(costNormal * 1.1);

  const costChartData = {
    labels: ['Hemat (-20%)', 'Hemat (-10%)', 'Saat Ini (Normal)', 'Tambahan (+10%)'],
    datasets: [
      {
        label: 'Estimasi Biaya Bulanan (Rp)',
        data: [costMinus20, costMinus10, costNormal, costPlus10],
        backgroundColor: ['#10b981', '#6366f1', '#3b82f6', '#f59e0b'],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Grafik Visualisasi & Analisis Konsumsi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Analisis grafik interaktif berbasis data peralatan dan tarif PLN terpasang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 font-bold text-xs">
            {calc.kwhPerMonth.toFixed(1)} kWh / Bulan
          </span>
        </div>
      </div>

      {/* Grid 2x2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Line Chart 30-Day Trend */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Grafik Estimasi Konsumsi Harian (30 Hari)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Proyeksi fluktuasi konsumsi harian dalam kWh</p>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Chart 2: Bar Chart per Kategori */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Grafik Konsumsi per Kategori</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Distribusi pemakaian listrik berdasarkan kategori peralatan</p>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Chart 3: Doughnut Chart Top Hogs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Proporsi Beban Alat Paling Boros</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Persentase kontribusi masing-masing peralatan terhadap total kWh</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>

        {/* Chart 4: Estimasi Variasi Biaya */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Simulasi Variasi Biaya Listrik Bulanan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Perbandingan estimasi pengeluaran dengan skenario hemat jam pemakaian</p>
          </div>
          <div className="h-64">
            <Bar data={costChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
