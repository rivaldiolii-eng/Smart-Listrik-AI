import React, { useState } from 'react';
import { Cpu, DollarSign, Calendar, Clock, AlertTriangle, Zap, Sliders, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { TokenData, HouseProfile, TokenSimulationResult } from '../types';
import { simulateToken } from '../utils/calculator';
import { playClickSound } from '../utils/audio';

interface TokenSimulatorProps {
  tokenData: TokenData;
  onSaveTokenData: (data: TokenData) => void;
  profile: HouseProfile;
  dailyKwhDemand: number;
}

export const TokenSimulator: React.FC<TokenSimulatorProps> = ({
  tokenData,
  onSaveTokenData,
  profile,
  dailyKwhDemand,
}) => {
  const [localToken, setLocalToken] = useState<TokenData>({ ...tokenData });
  const [customDailyKwh, setCustomDailyKwh] = useState<number>(dailyKwhDemand || 10);

  const presetsRp = [20000, 50000, 100000, 200000, 500000, 1000000];

  const currentSim = simulateToken(localToken, profile, dailyKwhDemand);
  const scenarioSim = simulateToken(localToken, profile, customDailyKwh);

  const handleUpdateNominal = (val: number) => {
    playClickSound();
    const updated = { ...localToken, nominalRp: val, customKwh: undefined };
    setLocalToken(updated);
    onSaveTokenData(updated);
  };

  const handleUpdateDate = (dateStr: string) => {
    playClickSound();
    const updated = { ...localToken, purchaseDate: dateStr };
    setLocalToken(updated);
    onSaveTokenData(updated);
  };

  const handleUpdatePPJ = (ppj: number) => {
    playClickSound();
    const updated = { ...localToken, ppjPercent: ppj };
    setLocalToken(updated);
    onSaveTokenData(updated);
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="p-6 rounded-2xl bg-indigo-900 dark:bg-gradient-to-r dark:from-indigo-950 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-700/30 dark:border-indigo-500/20 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 dark:text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
            Simulasi Token Prabayar PLN
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Kalkulator & Estimasi Ketahanan Token
          </h2>
          <p className="text-xs text-indigo-100 dark:text-zinc-300 mt-1 max-w-xl leading-relaxed">
            Perkirakan berapa hari dan tanggal berapa token listrik Strum Anda akan habis berdasarkan pola konsumsi beban riil rumah tangga.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/80 dark:bg-zinc-900/90 backdrop-blur-md border border-indigo-700/30 dark:border-zinc-800 text-center min-w-[180px]">
          <span className="text-[10px] uppercase font-bold text-indigo-200 dark:text-zinc-400 block">Sisa Ketahanan Token</span>
          <span className="text-3xl font-extrabold text-indigo-300 dark:text-indigo-400">{currentSim.daysDuration.toFixed(1)}</span>
          <span className="text-xs font-semibold text-indigo-100 dark:text-zinc-300 block">Hari (~{Math.round(currentSim.hoursDuration)} Jam)</span>
        </div>
      </div>

      {/* Simulator Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Configuration Column */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg space-y-5">
          <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Pengaturan Pembelian Token</span>
          </h3>

          {/* Nominal Quick Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
              Nominal Pembelian Token (Rp)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {presetsRp.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleUpdateNominal(val)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    localToken.nominalRp === val
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Rp {(val / 1000).toLocaleString('id-ID')}rb
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-zinc-400">Rp</span>
              <input
                type="number"
                min="5000"
                step="5000"
                value={localToken.nominalRp}
                onChange={(e) => handleUpdateNominal(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                placeholder="Nominal manual..."
              />
            </div>
          </div>

          {/* Tanggal Isi Token */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Tanggal Pengisian Token
            </label>
            <input
              type="date"
              value={localToken.purchaseDate}
              onChange={(e) => handleUpdateDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Pajak PPJ Daerah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Pajak Penerangan Jalan (PPJ Pemda)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 8].map((ppj) => (
                <button
                  key={ppj}
                  type="button"
                  onClick={() => handleUpdatePPJ(ppj)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    localToken.ppjPercent === ppj
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {ppj}% PPJ
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Potongan PPJ: Rp {Math.round((localToken.nominalRp * localToken.ppjPercent) / 100).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Primary Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Highlight Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center justify-between">
              <span>Hasil Perhitungan Token Strum</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Tarif Listrik: Rp {profile.customTariff || 1444.7}/kWh
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-zinc-400">kWh Didapatkan</span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{currentSim.purchasedKwh.toFixed(2)}</span>
                <span className="text-xs block mt-1 text-slate-500 dark:text-zinc-400">
                  Net: Rp {Math.round(currentSim.netNominalRp).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-zinc-400">Rata-rata Konsumsi</span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{currentSim.dailyKwh.toFixed(1)}</span>
                <span className="text-xs block mt-1 text-slate-500 dark:text-zinc-400">kWh / Hari</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-zinc-400">Perkiraan Habis</span>
                <span className="text-lg font-extrabold block truncate text-amber-600 dark:text-amber-400">
                  {currentSim.estimatedExpiryDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs block mt-1 text-slate-500 dark:text-zinc-400">
                  ~ {currentSim.daysDuration.toFixed(1)} Hari Pemakaian
                </span>
              </div>
            </div>

            {/* Token Longevity Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500 dark:text-zinc-400">
                  Estimasi Sisa Umur Token Hari Ini:
                </span>
                <span className={currentSim.isLowToken ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-indigo-600 dark:text-indigo-400'}>
                  {currentSim.daysRemaining.toFixed(1)} Hari
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    currentSim.isLowToken ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (currentSim.daysRemaining / Math.max(1, currentSim.daysDuration)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Interactive "What-If" Scenario Slider */}
          <div className="p-6 rounded-2xl bg-indigo-950 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-800 dark:border-indigo-500/20 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2 text-white">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Simulasi Hemat: Bagaimana Jika Konsumsi Listrik Ditekan?</span>
              </h4>
              <span className="text-xs font-bold text-indigo-300 dark:text-indigo-400">
                {scenarioSim.daysDuration.toFixed(1)} Hari
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-indigo-100 dark:text-zinc-300">
                <span>Asumsi Konsumsi Listrik Harian:</span>
                <strong className="text-indigo-300 dark:text-indigo-400">{customDailyKwh.toFixed(1)} kWh/hari</strong>
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(30, dailyKwhDemand * 2)}
                step="0.5"
                value={customDailyKwh}
                onChange={(e) => setCustomDailyKwh(Number(e.target.value))}
                className="w-full accent-indigo-400 dark:accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-indigo-200 dark:text-zinc-400">
                <span>1 kWh (Sangat Hemat)</span>
                <span>{dailyKwhDemand.toFixed(1)} kWh (Saat Ini)</span>
                <span>30+ kWh (Boros)</span>
              </div>
            </div>

            {customDailyKwh < dailyKwhDemand && (
              <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 dark:text-indigo-300 text-xs flex items-center gap-2">
                <TrendingDown className="w-4 h-4 shrink-0 text-indigo-300 dark:text-indigo-400" />
                <span>
                  Dengan mengurangi konsumsi menjadi <strong>{customDailyKwh.toFixed(1)} kWh/hari</strong>, token Anda bertahan{' '}
                  <strong>{(scenarioSim.daysDuration - currentSim.daysDuration).toFixed(1)} hari LEBIH LAMA!</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
