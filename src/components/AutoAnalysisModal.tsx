import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingDown, Zap, Calendar, DollarSign, Award, CheckCircle2, ShieldCheck, RefreshCw, Copy, Check, Download } from 'lucide-react';
import { CalculationResult, HouseProfile, TokenData, TokenSimulationResult } from '../types';
import { calculateEfficiencyScore } from '../utils/efficiency';
import { playAiDoneSound, playClickSound, playModalCloseSound } from '../utils/audio';

interface AutoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  calc: CalculationResult;
  profile: HouseProfile;
  tokenData: TokenData;
  tokenSim: TokenSimulationResult;
  onOpenAiAdvisor: (customPrompt?: string) => void;
}

export const AutoAnalysisModal: React.FC<AutoAnalysisModalProps> = ({
  isOpen,
  onClose,
  calc,
  profile,
  tokenData,
  tokenSim,
  onOpenAiAdvisor,
}) => {
  const [aiReportText, setAiReportText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const efficiency = calculateEfficiencyScore(calc, profile, calc.applianceBreakdown.map((b) => b.appliance));

  const mostEfficient = [...calc.applianceBreakdown].sort(
    (a, b) => a.kwhMonth - b.kwhMonth
  )[0];

  useEffect(() => {
    if (isOpen && !aiReportText) {
      generateReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const generateReport = async () => {
    setIsLoading(true);
    playClickSound();

    const topAppsStr = calc.topConsumingAppliances
      .slice(0, 3)
      .map((item) => `- ${item.appliance.name} (${item.appliance.watt}W, ${item.appliance.hoursPerDay} jam/hari): ~Rp ${Math.round(item.costMonth).toLocaleString('id-ID')} (${item.percentage.toFixed(0)}%)`)
      .join('\n');

    const leastAppStr = mostEfficient
      ? `${mostEfficient.appliance.name} (${mostEfficient.appliance.watt}W, ~Rp ${Math.round(mostEfficient.costMonth).toLocaleString('id-ID')}/bulan)`
      : 'Belum ada';

    const promptText = `Tolong buatkan Laporan Analisis Otomatis Penggunaan Listrik Rumah Lengkap dan Ramah dengan struktur berikut:

1. 📊 **Ringkasan Penggunaan Listrik**:
   - Nama Rumah: ${profile.name}
   - Daya Listrik: ${profile.dayaVA} VA (${profile.meterType})
   - Total Beban Instant: ${calc.totalWattLoad} Watt (${calc.loadPercentage.toFixed(0)}% dari batas daya)
   - Total Konsumsi Bulanan: ${calc.kwhPerMonth.toFixed(1)} kWh/bulan

2. 🔴 **Peralatan Paling Boros**:
${topAppsStr}

3. 🟢 **Peralatan Paling Hemat**:
   - ${leastAppStr}

4. 💰 **Total Biaya & Prediksi Bulan Depan**:
   - Tagihan/Biaya Bulan Ini: Rp ${Math.round(calc.costPerMonth).toLocaleString('id-ID')}
   - Estimasi Tagihan Bulan Depan (Stabil): Rp ${Math.round(calc.costPerMonth * 1.02).toLocaleString('id-ID')}
   - Estimasi Jika Berhasil Hemat 15%: Rp ${Math.round(calc.costPerMonth * 0.85).toLocaleString('id-ID')}

5. ⚡ **Prediksi Token PLN Prabayar**:
   - Pembelian Token Terakhir: Rp ${tokenData.nominalRp.toLocaleString('id-ID')} (${tokenSim.purchasedKwh.toFixed(1)} kWh)
   - Prediksi Ketahanan Token: ~${tokenSim.daysDuration.toFixed(1)} Hari (${tokenSim.estimatedExpiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})

6. 🏆 **Skor Efisiensi Rumah**:
   - Nilai: ${efficiency.score}/100 (${efficiency.emoji} ${efficiency.category})
   - Catatan: ${efficiency.primaryReason}

7. 💡 **Langkah Concrete Hemat Listrik dari Ipal AI**:
   - Berikan 3 poin langkah praktis yang bisa langsung dikerjakan pengguna sekarang juga.`;

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          context: {
            namaRumah: profile.name,
            dayaVA: profile.dayaVA,
            jenisMeter: profile.meterType,
            totalPeralatan: calc.applianceBreakdown.length,
            totalWatt: calc.totalWattLoad,
            kwhBulan: calc.kwhPerMonth,
            biayaBulan: calc.costPerMonth,
            topAppliance: calc.topConsumingAppliances[0]?.appliance.name || '-',
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setAiReportText(data.reply);
        playAiDoneSound();
      } else {
        throw new Error('Gagal memuat laporan');
      }
    } catch (err) {
      // Fallback structured text
      const fallbackReport = `Halo kak! Ini dia **Laporan Analisis Otomatis Konsumsi Listrik dari Ipal AI** untuk **${profile.name}**! ⚡📊

---

1. 📊 **Ringkasan Penggunaan Listrik**:
- Daya Listrik Rumah: **${profile.dayaVA} VA** (${profile.meterType})
- Total Beban Peralatan: **${calc.totalWattLoad} Watt** (${calc.loadPercentage.toFixed(0)}% beban maksimum)
- Total Pemakaian: **${calc.kwhPerMonth.toFixed(1)} kWh/bulan**

2. 🔴 **Peralatan Paling Boros**:
- **${calc.topConsumingAppliances[0]?.appliance.name || 'Alat Utama'}**: ~Rp ${Math.round(calc.topConsumingAppliances[0]?.costMonth || 0).toLocaleString('id-ID')}/bulan (${calc.topConsumingAppliances[0]?.percentage.toFixed(0) || 0}% porsi tagihan)

3. 🟢 **Peralatan Paling Hemat**:
- **${mostEfficient?.appliance.name || 'Lampu LED'}**: ~Rp ${Math.round(mostEfficient?.costMonth || 0).toLocaleString('id-ID')}/bulan

4. 💰 **Total Biaya & Prediksi Bulan Depan**:
- Estimasi Biaya Bulan Ini: **Rp ${Math.round(calc.costPerMonth).toLocaleString('id-ID')}**
- Prediksi Biaya Bulan Depan (Skenario Normal): **Rp ${Math.round(calc.costPerMonth * 1.02).toLocaleString('id-ID')}**
- Target Hemat (Optimasi Pemakaian): **Rp ${Math.round(calc.costPerMonth * 0.85).toLocaleString('id-ID')}**

5. ⚡ **Prediksi Token Listrik**:
- Pembelian Token Rp ${tokenData.nominalRp.toLocaleString('id-ID')} menghasilkan **${tokenSim.purchasedKwh.toFixed(1)} kWh**
- Diperkirakan bertahan sekitar **${tokenSim.daysDuration.toFixed(1)} hari** (sampai tanggal ${tokenSim.estimatedExpiryDate.toLocaleDateString('id-ID')}).

6. 🏆 **Skor Efisiensi Rumah**: **${efficiency.score}/100** (${efficiency.emoji} ${efficiency.category})
*${efficiency.primaryReason}*

7. 💡 **Tips Penghematan Paling Efektif**:
- Kurangi durasi pemakaian **${calc.topConsumingAppliances[0]?.appliance.name || 'alat utama'}** sebanyak 1-2 jam per hari.
- Cabut steker charger & perangkat elektronik standby di malam hari.
- Atur timer otomatis pada peralatan pendingin atau pemanas.`;

      setAiReportText(fallbackReport);
      playAiDoneSound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiReportText) return;
    navigator.clipboard.writeText(aiReportText);
    setCopied(true);
    playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-indigo-50/80 dark:bg-gradient-to-r dark:from-indigo-950 dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                Analisis Otomatis Ipal AI
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${efficiency.badgeBg} ${efficiency.badgeColor} ${efficiency.badgeBorder}`}>
                  {efficiency.emoji} {efficiency.category}
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">Laporan komprehensif profil & prediksi energi rumah</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Quick Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">Skor Efisiensi</span>
              <span className={`text-lg font-black ${efficiency.badgeColor}`}>
                {efficiency.score}/100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">Total Biaya/Bulan</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                Rp {Math.round(calc.costPerMonth).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">Paling Boros</span>
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400 truncate block">
                {calc.topConsumingAppliances[0]?.appliance.name || 'Belum ada'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">Token Habis dalam</span>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block">
                ~{tokenSim.daysDuration.toFixed(1)} Hari
              </span>
            </div>
          </div>

          {/* AI Generated Detailed Report Container */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-indigo-500/30 text-slate-800 dark:text-zinc-200 leading-relaxed space-y-3 relative">
            {isLoading ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto animate-bounce" />
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                  Ipal AI sedang menyusun laporan analisis otomatis lengkap...
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Mengkalkulasi beban, efisiensi, dan proyeksi hemat energi</p>
              </div>
            ) : (
              <>
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-zinc-200 font-medium">
                  {aiReportText}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    onClick={generateReport}
                    className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Muat Ulang Analisis</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Laporan'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-100/60 dark:bg-zinc-950/60 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 hidden sm:block font-medium">
            Ingin berkonsultasi lebih lanjut mengenai laporan ini?
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 font-bold text-xs transition-colors"
            >
              Tutup
            </button>

            <button
              onClick={() => {
                handleClose();
                onOpenAiAdvisor('Jelaskan rincian rekomendasi penghematan dari Laporan Analisis Otomatis saya!');
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tanya Ipal AI Lebih Lanjut</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
