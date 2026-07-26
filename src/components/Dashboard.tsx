import React from 'react';
import {
  Zap,
  DollarSign,
  Calendar,
  Flame,
  Activity,
  Camera,
  Mic,
  Plus,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
  Lightbulb,
  Gauge,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { HouseProfile, CalculationResult, TokenSimulationResult } from '../types';
import { playMenuOpenSound, playTabSwitchSound, playClickSound } from '../utils/audio';
import { calculateEfficiencyScore } from '../utils/efficiency';
import { AnimatedNumber } from './AnimatedNumber';

interface DashboardProps {
  userName?: string;
  profile: HouseProfile;
  calc: CalculationResult;
  tokenSim: TokenSimulationResult;
  onOpenScanLabel: () => void;
  onOpenVoiceInput: () => void;
  onOpenAddAppliance: () => void;
  onOpenAiAdvisor: (customPrompt?: string) => void;
  onOpenAutoAnalysis: () => void;
  onNavigateToTab: (tab: 'appliances' | 'simulator' | 'charts' | 'ai') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userName,
  profile,
  calc,
  tokenSim,
  onOpenScanLabel,
  onOpenVoiceInput,
  onOpenAddAppliance,
  onOpenAiAdvisor,
  onOpenAutoAnalysis,
  onNavigateToTab,
}) => {
  const appliances = calc.applianceBreakdown.map((b) => b.appliance);
  const efficiency = calculateEfficiencyScore(calc, profile, appliances);
  const displayName = userName || 'Andi';

  // Determine Progress Penggunaan Daya status & colors (Hijau 0-60%, Kuning 61-80%, Oranye 81-100%, Merah >100%)
  const getProgressStatus = () => {
    const loadPct = calc.loadPercentage;
    if (loadPct > 100) {
      return {
        label: 'OVERLOAD - Berisiko Trip / Jepret!',
        barBg: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-500/30',
        bgColor: 'bg-red-500/10',
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      };
    }
    if (loadPct >= 81) {
      return {
        label: 'Waspada Beban Tinggi (81–100%)',
        barBg: 'bg-orange-500',
        textColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-500/30',
        bgColor: 'bg-orange-500/10',
        icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
      };
    }
    if (loadPct >= 61) {
      return {
        label: 'Pemakaian Moderat (61–80%)',
        barBg: 'bg-yellow-500',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        borderColor: 'border-yellow-500/30',
        bgColor: 'bg-yellow-500/10',
        icon: <Gauge className="w-4 h-4 text-yellow-500" />,
      };
    }
    return {
      label: 'Pemakaian Aman (0–60%)',
      barBg: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    };
  };

  const progressStatus = getProgressStatus();

  // Dynamic Energy Insight statement generator
  const getEnergyInsightText = () => {
    const topApp = calc.topConsumingAppliances[0];
    if (calc.isOverCapacity) {
      return `${displayName}, penggunaan listrik rumahmu melampaui kapasitas terpasang. Matikan peralatan non-esensial untuk mencegah sakelar MCB terputus.`;
    }
    if (topApp && topApp.percentage >= 40) {
      return `${displayName}, ${topApp.appliance.name} masih menjadi penyumbang konsumsi listrik terbesar, menyedot ${topApp.percentage.toFixed(0)}% dari total tagihan bulanan.`;
    }
    if (calc.loadPercentage >= 75) {
      return `${displayName}, penggunaan listrik hari ini cukup tinggi (mencapai ${calc.loadPercentage.toFixed(0)}% batas beban ${profile.dayaVA} VA).`;
    }
    if (appliances.length === 0) {
      return `${displayName}, belum ada peralatan listrik yang ditambahkan. Tambahkan peralatan untuk melihat rekomendasi dari Ipal AI.`;
    }
    return `${displayName}, penggunaan listrik rumahmu hari ini masih normal.`;
  };

  // Ranking color bars for top 5 boros
  const getRankGradient = (index: number) => {
    switch (index) {
      case 0:
        return 'from-red-500 to-rose-600';
      case 1:
        return 'from-orange-500 to-amber-500';
      case 2:
        return 'from-amber-500 to-yellow-500';
      case 3:
        return 'from-indigo-500 to-blue-500';
      default:
        return 'from-cyan-500 to-teal-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            Halo, {displayName} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Selamat datang kembali di Smart Listrik AI. Berikut pantauan listrik rumah Anda hari ini.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold w-fit">
          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span>{profile.name} ({profile.dayaVA} VA)</span>
        </div>
      </div>

      {/* Quick Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            playMenuOpenSound();
            onOpenScanLabel();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-zinc-100 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 mb-2 group-hover:rotate-6 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
            Scan Label Daya
          </span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Ipal AI Vision Stiker
          </span>
        </button>

        <button
          onClick={() => {
            playMenuOpenSound();
            onOpenVoiceInput();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-zinc-100 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 mb-2 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
            Input Suara
          </span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Bicara ke Ipal AI
          </span>
        </button>

        <button
          onClick={() => {
            playMenuOpenSound();
            onOpenAddAppliance();
          }}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-zinc-100 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 mb-2 group-hover:rotate-90 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
            Tambah Alat
          </span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Manual / Katalog
          </span>
        </button>

        <button
          onClick={() => {
            playTabSwitchSound();
            onOpenAiAdvisor();
          }}
          className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-indigo-900 dark:text-indigo-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center text-center group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white mb-2 group-hover:bounce transition-transform shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-sm text-indigo-950 dark:text-indigo-300">
            Ipal AI Advisor
          </span>
          <span className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
            Konsultasi Energi
          </span>
        </button>
      </div>

      {/* Progress Penggunaan Daya (Power Capacity Bar with 4 status levels) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md transition-all hover:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Progress Penggunaan Daya Rumah
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold flex items-center gap-1.5 ${progressStatus.bgColor} ${progressStatus.textColor} ${progressStatus.borderColor}`}
              >
                {progressStatus.icon}
                <span>{progressStatus.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Kapasitas PLN Terpasang:{' '}
              <strong className="text-slate-800 dark:text-zinc-200">
                <AnimatedNumber value={profile.dayaVA} /> VA
              </strong>
            </p>
          </div>

          <div className="text-right">
            <span className={`text-2xl font-black ${progressStatus.textColor}`}>
              <AnimatedNumber
                value={calc.loadPercentage}
                formatter={(v) => v.toFixed(1)}
              />
              %
            </span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <AnimatedNumber value={calc.totalWattLoad} /> Watt / {profile.dayaVA} VA
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${progressStatus.barBg}`}
            style={{ width: `${Math.min(100, calc.loadPercentage)}%` }}
          />
        </div>

        {/* Multi-tier status Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Hijau: 0–60% (Aman)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Kuning: 61–80% (Moderat)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Oranye: 81–100% (Waspada)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Merah: &gt;100% (Overload)</span>
          </div>
        </div>
      </div>

      {/* Energy Insight Section */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-zinc-900 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                Analisis Otomatis Ipal AI
              </span>
              <h3 className="font-extrabold text-base text-white">Energy Insight</h3>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onOpenAiAdvisor(
                `Berikan analisis energy insight mendalam untuk profil rumah saya (${profile.dayaVA} VA, ${appliances.length} alat, total ${calc.kwhPerMonth.toFixed(1)} kWh/bulan).`
              );
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 border border-indigo-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Tanya Detail Ipal AI</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-sm font-medium text-indigo-100 bg-indigo-950/70 p-4 rounded-xl border border-indigo-500/20 leading-relaxed shadow-inner">
          "{getEnergyInsightText()}"
        </p>
      </div>

      {/* Smart Analytics Dashboard (6 Key Stat Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Analytics Dashboard</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            Real-time Sync
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Total Konsumsi Hari Ini */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Konsumsi Hari Ini
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                <AnimatedNumber
                  value={calc.kwhPerDay}
                  formatter={(v) => v.toFixed(1)}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                kWh / hari
              </span>
            </div>
          </div>

          {/* Card 2: Total Konsumsi Bulan Ini */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Konsumsi Bulan Ini
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                <AnimatedNumber
                  value={calc.kwhPerMonth}
                  formatter={(v) => v.toFixed(1)}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                kWh / bulan
              </span>
            </div>
          </div>

          {/* Card 3: Estimasi Biaya Bulan Ini */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Biaya Bulan Ini
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 truncate">
                Rp{' '}
                <AnimatedNumber
                  value={calc.costPerMonth}
                  formatter={(v) => Math.round(v).toLocaleString('id-ID')}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                Estimasi tagihan
              </span>
            </div>
          </div>

          {/* Card 4: Estimasi Token Tersisa */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Token Tersisa
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            {profile.meterType === 'Prabayar' ? (
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                  <AnimatedNumber
                    value={tokenSim.daysRemaining}
                    formatter={(v) => v.toFixed(1)}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Hari Lagi ({tokenSim.purchasedKwh.toFixed(0)} kWh)
                </span>
              </div>
            ) : (
              <div>
                <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 truncate">
                  Rp{' '}
                  <AnimatedNumber
                    value={calc.costPerYear}
                    formatter={(v) => Math.round(v).toLocaleString('id-ID')}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Tagihan Tahunan
                </span>
              </div>
            )}
          </div>

          {/* Card 5: Rata-rata Konsumsi Harian */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Rata-rata Harian
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                <AnimatedNumber
                  value={calc.kwhPerDay}
                  formatter={(v) => v.toFixed(1)}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                kWh / hari
              </span>
            </div>
          </div>

          {/* Card 6: Skor Efisiensi Rumah (0-100) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Skor Efisiensi
              </span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div
                className={`text-xl sm:text-2xl font-black ${efficiency.badgeColor}`}
              >
                <AnimatedNumber value={efficiency.score} /> / 100
              </div>
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-zinc-300">
                {efficiency.emoji} {efficiency.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Penggunaan Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Ringkasan Penggunaan Listrik
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Rangkuman statistik beban terpasang dan estimasi finansial
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            Realtime Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Jumlah Peralatan
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              <AnimatedNumber value={calc.totalApplianceUnits} /> Unit
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {appliances.length} jenis alat terdaftar
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Total Daya
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              <AnimatedNumber value={calc.totalWattLoad} /> Watt
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Beban puncak bersamaan
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Total Konsumsi
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              <AnimatedNumber
                value={calc.kwhPerDay}
                formatter={(v) => v.toFixed(1)}
              />{' '}
              <span className="text-sm font-bold text-slate-500">kWh/hari</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              ~{calc.kwhPerMonth.toFixed(1)} kWh/bulan
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
              Estimasi Biaya
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 truncate">
              Rp{' '}
              <AnimatedNumber
                value={calc.costPerMonth}
                formatter={(v) => Math.round(v).toLocaleString('id-ID')}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              / bulan (Tarif PLN)
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 Peralatan Paling Boros & AI Quick Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top 5 Hogs List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Top 5 Peralatan Paling Boros
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ranking peralatan berdasarkan konsumsi kWh terbesar per bulan
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('appliances')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Kelola Alat</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {calc.topConsumingAppliances.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-zinc-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">
                Belum ada data peralatan listrik.
              </p>
              <button
                onClick={onOpenAddAppliance}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-500 transition-colors"
              >
                + Tambah Peralatan Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {calc.topConsumingAppliances.slice(0, 5).map((item, idx) => (
                <div
                  key={item.appliance.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 flex items-center justify-center text-xs font-extrabold border border-slate-300 dark:border-zinc-700 shadow-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {item.appliance.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {item.appliance.watt} W • {item.appliance.quantity} unit
                          • {item.appliance.hoursPerDay} jam/hari
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                        {item.kwhMonth.toFixed(1)} kWh
                      </span>
                      <span className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                        Rp {Math.round(item.costMonth).toLocaleString('id-ID')}{' '}
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Indicator Color Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getRankGradient(idx)} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Quick Insight & Action Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 border border-indigo-500/20 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommendation
              </span>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>

            <h3 className="text-lg font-extrabold mb-2 text-white">
              Saran Penghematan Cepat
            </h3>

            <p className="text-xs text-zinc-200 leading-relaxed mb-4">
              {calc.topConsumingAppliances[0] ? (
                <>
                  Peralatan paling boros Anda adalah{' '}
                  <strong className="text-indigo-300 font-extrabold">
                    {calc.topConsumingAppliances[0].appliance.name}
                  </strong>{' '}
                  ({calc.topConsumingAppliances[0].percentage.toFixed(0)}% beban).
                  Jika pemakaian dikurangi 2 jam/hari, Anda bisa menghemat hingga{' '}
                  <strong className="text-emerald-300 font-extrabold">
                    Rp{' '}
                    {Math.round(
                      calc.topConsumingAppliances[0].costMonth *
                        (2 /
                          Math.max(
                            1,
                            calc.topConsumingAppliances[0].appliance.hoursPerDay
                          ))
                    ).toLocaleString('id-ID')}
                    /bulan
                  </strong>
                  !
                </>
              ) : (
                'Tambahkan daftar alat rumah Anda untuk membuka analisis potensi penghematan listrik hingga 30%!'
              )}
            </p>

            <div className="space-y-2 text-xs text-zinc-200 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Penggunaan steker pintar (timer AC & Pompa)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Suhu AC ideal di 24°C - 25°C</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenAiAdvisor()}
            className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buka AI Advisor Lengkap</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

