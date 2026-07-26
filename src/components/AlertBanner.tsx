import React from 'react';
import { AlertTriangle, Clock, TrendingUp, X, Sparkles } from 'lucide-react';
import { CalculationResult, TokenSimulationResult } from '../types';

interface AlertBannerProps {
  userName?: string;
  calc: CalculationResult;
  tokenSim: TokenSimulationResult;
  onOpenAiAdvisor: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ userName, calc, tokenSim, onOpenAiAdvisor }) => {
  const [dismissed, setDismissed] = React.useState<Record<string, boolean>>({});
  const displayName = userName || 'Andi';

  const handleDismiss = (key: string) => {
    setDismissed((prev) => ({ ...prev, [key]: true }));
  };

  const showCapacityAlert = (calc.isOverCapacity || calc.isNearCapacity) && !dismissed['capacity'];
  const showTokenAlert = tokenSim.isLowToken && !dismissed['token'];

  if (!showCapacityAlert && !showTokenAlert) return null;

  return (
    <div className="space-y-3 mb-6">
      {/* Power Capacity Overload / High Load Alert */}
      {showCapacityAlert && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-md transition-all ${
          calc.isOverCapacity
            ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/40 text-red-900 dark:text-red-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              calc.isOverCapacity ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950 font-bold'
            }`}>
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className={`font-extrabold text-sm ${
                calc.isOverCapacity ? 'text-red-950 dark:text-red-100' : 'text-amber-950 dark:text-amber-100'
              }`}>
                {calc.isOverCapacity 
                  ? 'PERINGATAN KAPASITAS DAYA LISTRIK TERLAMPAUI!' 
                  : 'PERINGATAN: Pemakaian Beban Melebihi 80% Daya Rumah'}
              </h4>
              <p className={`text-xs mt-1 leading-relaxed ${
                calc.isOverCapacity ? 'text-red-900 dark:text-red-200' : 'text-amber-900 dark:text-amber-200'
              }`}>
                {calc.isOverCapacity ? (
                  <>Total beban semua peralatan aktif Anda mencapai <strong className="font-extrabold">{calc.totalWattLoad} Watt</strong>. Risiko tinggi sakelar MCB pembatas listrik mati mendadak (jepret)!</>
                ) : (
                  <>Total beban listrik Anda saat ini mencapai <strong className="font-extrabold">{calc.totalWattLoad} Watt ({calc.loadPercentage.toFixed(1)}%)</strong> dari total daya terpasang. Sebaiknya matikan alat yang tidak terpakai.</>
                )}
              </p>
              <button
                onClick={onOpenAiAdvisor}
                className="mt-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 underline flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Tanyakan Ipal AI alat mana yang perlu dimatikan
              </button>
            </div>
          </div>
          <button
            onClick={() => handleDismiss('capacity')}
            className={`p-1.5 rounded-lg transition-colors ${
              calc.isOverCapacity 
                ? 'text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-950 dark:hover:text-white' 
                : 'text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-950 dark:hover:text-white'
            }`}
            title="Tutup peringatan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Low Token Alert (< 5 days) */}
      {showTokenAlert && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 flex items-start justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">Peringatan Token Listrik Diperkirakan Segera Habis</h4>
              <p className="text-xs text-amber-900 dark:text-amber-200 mt-1 leading-relaxed">
                <strong className="font-extrabold">{displayName}</strong>, token listrik diperkirakan habis dalam <strong className="font-extrabold">{Math.round(tokenSim.daysRemaining) || 1} hari</strong> (Perkiraan habis: {tokenSim.estimatedExpiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}).
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDismiss('token')}
            className="p-1.5 rounded-lg text-amber-800 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-950 dark:hover:text-white transition-colors"
            title="Tutup peringatan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
