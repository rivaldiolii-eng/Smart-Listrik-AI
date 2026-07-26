import React, { useState } from 'react';
import { Sparkles, Lightbulb, Zap, ArrowRight, ShieldCheck, RefreshCw, Award, AlertCircle } from 'lucide-react';
import { CalculationResult, HouseProfile } from '../types';
import { calculateEfficiencyScore, getDailyInsight, DailyInsight } from '../utils/efficiency';
import { playClickSound, playMenuOpenSound } from '../utils/audio';

interface DailyInsightCardProps {
  calc: CalculationResult;
  profile: HouseProfile;
  onOpenAutoAnalysis: () => void;
  onOpenAiAdvisor: (customPrompt?: string) => void;
}

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({
  calc,
  profile,
  onOpenAutoAnalysis,
  onOpenAiAdvisor,
}) => {
  const appliances = calc.applianceBreakdown.map((b) => b.appliance);
  const efficiency = calculateEfficiencyScore(calc, profile, appliances);
  const [insight, setInsight] = useState<DailyInsight>(() =>
    getDailyInsight(calc, appliances, profile)
  );

  const handleRefreshInsight = () => {
    playClickSound();
    // Pick another tip from pool randomly
    const newTip = getDailyInsight(
      calc,
      appliances,
      profile
    );
    setInsight(newTip);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* House Efficiency Score Widget (1 col on md) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Skor Efisiensi Rumah
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold flex items-center gap-1 ${efficiency.badgeBg} ${efficiency.badgeColor} ${efficiency.badgeBorder}`}
            >
              <span>{efficiency.emoji}</span>
              <span>{efficiency.category}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className={`text-4xl font-black tracking-tight ${efficiency.badgeColor}`}>
              {efficiency.score}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">/ 100 poin</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800/80">
            {efficiency.primaryReason}
          </p>
        </div>

        <button
          onClick={() => {
            playMenuOpenSound();
            onOpenAutoAnalysis();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-indigo-100 group-hover:rotate-12 transition-transform" />
          <span>Buka Analisis Otomatis Ipal AI</span>
          <ArrowRight className="w-3.5 h-3.5 ml-auto text-indigo-200" />
        </button>
      </div>

      {/* Daily Insight (Tips Hari Ini) Card (2 cols on md) */}
      <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  💡 Tips Hari Ini dari Ipal AI
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">{insight.title}</h4>
              </div>
            </div>

            <button
              onClick={handleRefreshInsight}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs transition-colors"
              title="Ganti Tips"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed bg-slate-50 dark:bg-zinc-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 font-medium">
            "{insight.tip}"
          </p>

          {insight.potentialSavingRp && insight.potentialSavingRp > 0 && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold px-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Potensi Hemat: ~Rp {insight.potentialSavingRp.toLocaleString('id-ID')}/bulan</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            Kategori: <strong className="text-slate-800 dark:text-zinc-300">{insight.category}</strong>
          </span>

          <button
            onClick={() => {
              playClickSound();
              onOpenAiAdvisor(`Tanyakan lebih detail tentang tips ini: "${insight.title}" - ${insight.tip}`);
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>Tanya Ipal AI tentang tips ini</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
