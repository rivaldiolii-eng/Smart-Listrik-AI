import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Square,
  Key,
  MessageSquarePlus,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { CalculationResult, HouseProfile, AiChatMessage, TokenData, TokenSimulationResult } from '../types';
import { loadAiChatHistory, saveAiChatHistory } from '../utils/storage';
import { playAiDoneSound, playClickSound, playMenuOpenSound } from '../utils/audio';
import { calculateEfficiencyScore } from '../utils/efficiency';
import { sendIpalAiMessage, checkAiStatus, AiStatus, ContextPayload } from '../services/aiService';
import { AiSettingsModal } from './AiSettingsModal';

interface AiAdvisorProps {
  userName?: string;
  calc: CalculationResult;
  profile: HouseProfile;
  tokenData?: TokenData;
  tokenSim?: TokenSimulationResult;
  onOpenAutoAnalysis?: () => void;
  initialPrompt?: string | null;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  userName,
  calc,
  profile,
  tokenData,
  tokenSim,
  onOpenAutoAnalysis,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>('unconfigured');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const displayName = userName || 'Andi';

  const efficiency = calculateEfficiencyScore(
    calc,
    profile,
    calc.applianceBreakdown.map((b) => b.appliance)
  );

  // Load initial chat history and status
  useEffect(() => {
    checkAiStatus().then((res) => setAiStatus(res.status));

    const history = loadAiChatHistory();
    if (history.length > 0) {
      setMessages(history);
      const lastUser = [...history].reverse().find((m) => m.sender === 'user');
      if (lastUser) setLastUserPrompt(lastUser.text);
    } else {
      const welcomeMsg: AiChatMessage = {
        id: 'welcome-1',
        sender: 'model',
        text: `Halo ${displayName}! Saya Ipal AI. Ada yang ingin kita cek hari ini? ⚡

Saya telah membaca seluruh data profil **${profile.name}** (${profile.dayaVA} VA, ${profile.meterType}).

**📊 Ringkasan Konsumsi & Efisiensi Listrik:**
- Skor Efisiensi Rumah: **${efficiency.score}/100** (${efficiency.emoji} ${efficiency.category})
- Total Beban Peralatan: **${calc.totalWattLoad} Watt** (${calc.loadPercentage.toFixed(0)}% dari batas daya)
- Estimasi Pemakaian: **${calc.kwhPerMonth.toFixed(1)} kWh/bulan** (~Rp ${Math.round(calc.costPerMonth).toLocaleString('id-ID')})
- Peralatan Paling Boros: **${calc.topConsumingAppliances[0]?.appliance.name || 'Belum ada'}** (${calc.topConsumingAppliances[0]?.percentage.toFixed(0) || 0}% tagihan)

Silakan pilih pertanyaan cepat di bawah ini atau ketik pertanyaan langsung untuk Ipal AI ya! 😊`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMsg]);
      saveAiChatHistory([welcomeMsg]);
    }
  }, [displayName]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const quickPrompts = [
    '• Kenapa listrik saya boros?',
    '• Bagaimana cara menghemat?',
    '• Alat mana yang paling mahal?',
    '• Kalau saya beli token Rp100.000, kira-kira tahan berapa hari?',
    '• Apakah daya rumah saya perlu ditambah?',
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isGenerating) return;

    playClickSound();

    const userMessage: AiChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setLastUserPrompt(promptToSend.trim());
    setIsGenerating(true);
    setErrorMsg(null);

    // Prepare full context
    const appliancesStr = calc.applianceBreakdown
      .map(
        (b) =>
          `- ${b.appliance.name} (${b.appliance.category}): ${b.appliance.watt}W x ${b.appliance.quantity} unit, ${b.appliance.hoursPerDay} jam/hari = ${b.kwhMonth.toFixed(1)} kWh/bulan (~Rp ${Math.round(b.costMonth).toLocaleString('id-ID')}, ${b.percentage.toFixed(0)}%)`
      )
      .join('\n');

    const leastConsuming = [...calc.applianceBreakdown].sort((a, b) => a.kwhMonth - b.kwhMonth)[0];

    const contextPayload: ContextPayload = {
      userName: displayName,
      namaRumah: profile.name,
      dayaVA: profile.dayaVA,
      jenisMeter: profile.meterType,
      occupants: profile.occupants,
      totalPeralatan: calc.applianceBreakdown.length,
      totalWatt: calc.totalWattLoad,
      persenBeban: Math.round(calc.loadPercentage),
      kwhBulan: calc.kwhPerMonth,
      biayaBulan: calc.costPerMonth,
      biayaTahun: calc.costPerYear,
      skorEfisiensi: efficiency.score,
      kategoriEfisiensi: efficiency.category,
      topAppliance: calc.topConsumingAppliances[0]
        ? `${calc.topConsumingAppliances[0].appliance.name} (${calc.topConsumingAppliances[0].percentage.toFixed(0)}% tagihan)`
        : 'Belum ada',
      leastAppliance: leastConsuming ? `${leastConsuming.appliance.name} (${leastConsuming.appliance.watt}W)` : 'Belum ada',
      nominalToken: tokenData?.nominalRp || 100000,
      kwhToken: tokenSim?.purchasedKwh || 60,
      hariToken: tokenSim?.daysDuration ? Math.round(tokenSim.daysDuration) : 10,
      daftarPeralatanStr: appliancesStr || '- Belum ada peralatan terdaftar',
    };

    const historyPayload = updatedMessages.map((m) => ({
      role: m.sender,
      text: m.text,
    }));

    abortControllerRef.current = new AbortController();

    try {
      const replyText = await sendIpalAiMessage(
        promptToSend,
        contextPayload,
        historyPayload,
        abortControllerRef.current.signal
      );

      const modelMessage: AiChatMessage = {
        id: `model-${Date.now()}`,
        sender: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      const finalHistory = [...updatedMessages, modelMessage];
      setMessages(finalHistory);
      saveAiChatHistory(finalHistory);
      playAiDoneSound();
      setAiStatus('connected');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const cancelMsg: AiChatMessage = {
          id: `model-cancel-${Date.now()}`,
          sender: 'model',
          text: '⏹️ Respons dihentikan oleh pengguna.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        const newHist = [...updatedMessages, cancelMsg];
        setMessages(newHist);
        saveAiChatHistory(newHist);
      } else {
        console.error('Error generating AI response:', err);
        setErrorMsg(err.message || 'Gagal terhubung ke Gemini API.');
        setAiStatus('failed');

        // Rule-based fallback response so the chat doesn't feel broken
        let fallbackText = `Halo ${displayName}! Ipal AI mengalami kendala koneksi ke server, namun berikut analisis otomatis berdasarkan data rumah Anda: ⚡\n\n`;

        if (promptToSend.toLowerCase().includes('boros')) {
          fallbackText += `Listrik rumah **${profile.name}** paling banyak dikonsumsi oleh **${calc.topConsumingAppliances[0]?.appliance.name || 'peralatan utama'}** (${calc.topConsumingAppliances[0]?.percentage.toFixed(0) || 0}% total tagihan). Total konsumsi saat ini adalah **${calc.kwhPerMonth.toFixed(1)} kWh/bulan** (~Rp ${Math.round(calc.costPerMonth).toLocaleString('id-ID')}).`;
        } else if (promptToSend.toLowerCase().includes('token')) {
          fallbackText += `Berdasarkan pembelian token **Rp ${(tokenData?.nominalRp || 100000).toLocaleString('id-ID')}** (~${(tokenSim?.purchasedKwh || 60).toFixed(1)} kWh), token Anda diperkirakan bertahan sekitar **${(tokenSim?.daysDuration || 10).toFixed(1)} hari** (pemakaian harian: ${calc.kwhPerDay.toFixed(1)} kWh/hari).`;
        } else {
          fallbackText += `1. 💡 Matikan **${calc.topConsumingAppliances[0]?.appliance.name || 'peralatan berdaya tinggi'}** saat tidak dipakai.\n2. 🔌 Atur suhu pendingin ruangan di 24°C-25°C.\n3. ⚡ Pastikan beban total (${calc.totalWattLoad} Watt) berada di bawah kapasitas (${profile.dayaVA} VA).`;
        }

        const fallbackMessage: AiChatMessage = {
          id: `model-fb-${Date.now()}`,
          sender: 'model',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };

        const finalHistory = [...updatedMessages, fallbackMessage];
        setMessages(finalHistory);
        saveAiChatHistory(finalHistory);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    playClickSound();
    const welcomeMsg: AiChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'model',
      text: `Halo ${displayName}! Sesi percakapan baru dengan Ipal AI telah dimulai. Ada yang bisa Ipal AI bantu untuk kelistrikan rumah Anda hari ini? ⚡`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
    saveAiChatHistory([welcomeMsg]);
    setErrorMsg(null);
  };

  const handleClearHistory = () => {
    playClickSound();
    setMessages([]);
    saveAiChatHistory([]);
    setErrorMsg(null);
  };

  const handleCopyText = (id: string, text: string) => {
    playClickSound();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Status Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950 border border-indigo-500/20 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Ipal AI Smart Engine
            </span>

            {/* AI Status Badge */}
            <button
              onClick={() => setIsAiSettingsOpen(true)}
              className="px-3 py-1 rounded-full text-xs font-bold border transition-transform hover:scale-105 flex items-center gap-1.5"
            >
              {aiStatus === 'connected' && (
                <span className="text-emerald-400 border-emerald-500/40 bg-emerald-950/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  🟢 Gemini Terhubung
                </span>
              )}
              {aiStatus === 'unconfigured' && (
                <span className="text-amber-300 border-amber-500/40 bg-amber-950/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  🟡 API Key Belum Diisi
                </span>
              )}
              {aiStatus === 'failed' && (
                <span className="text-red-300 border-red-500/40 bg-red-950/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  🔴 Gagal Terhubung
                </span>
              )}
            </button>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
            Ipal AI Advisor
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${efficiency.badgeBg} ${efficiency.badgeColor} ${efficiency.badgeBorder}`}>
              {efficiency.emoji} Skor {efficiency.score}/100
            </span>
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
            Asisten konsultan energi pribadi untuk {displayName}. Menjawab pertanyaan spesifik berdasarkan data beban daya ({calc.totalWattLoad}W) dan konsumsi rumah Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              playMenuOpenSound();
              setIsAiSettingsOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 text-zinc-200 transition-colors"
          >
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Pengaturan AI</span>
          </button>

          {onOpenAutoAnalysis && (
            <button
              onClick={() => {
                playMenuOpenSound();
                onOpenAutoAnalysis();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analisis Otomatis</span>
            </button>
          )}

          <button
            onClick={handleNewChat}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors text-zinc-300"
            title="Sesi Chat Baru"
          >
            <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Chat Baru</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold flex items-center gap-1 transition-colors text-zinc-400"
            title="Hapus Riwayat Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl flex flex-col h-[620px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {lastUserPrompt && (
                <button
                  onClick={() => handleSendMessage(lastUserPrompt)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`p-2 rounded-2xl shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="group relative max-w-[85%] sm:max-w-[80%]">
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium shadow-md'
                      : 'bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-tl-none font-medium'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans leading-relaxed">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-2 font-semibold ${
                      msg.sender === 'user' ? 'text-indigo-100 text-right' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Copy Button for Model messages */}
                {msg.sender === 'model' && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 transition-all shadow-sm text-[10px] flex items-center gap-1"
                    title="Salin jawaban AI"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-2 rounded-2xl bg-indigo-600 text-white">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 text-xs text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 flex items-center gap-2 font-semibold shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping delay-300" />
                </div>
                <span>Ipal AI sedang mengetik & menyusun rekomendasi... ⚡</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Carousel */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Pertanyaan Cepat Ipal AI:
              </span>
            </div>

            {lastUserPrompt && !isGenerating && (
              <button
                onClick={() => handleSendMessage(lastUserPrompt)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kirim Ulang Pertanyaan Terakhir</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex items-center gap-2 pb-1 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isGenerating}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-600/10 text-slate-800 dark:text-zinc-200 text-xs font-bold whitespace-nowrap transition-all shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-end gap-2">
          <textarea
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan analisis, tips hemat, atau saran listrik ke Ipal AI... (Shift+Enter untuk baris baru)"
            disabled={isGenerating}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-zinc-500 resize-none max-h-24 font-medium"
          />

          {isGenerating ? (
            <button
              onClick={handleStopGenerating}
              className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 transition-all shrink-0"
              title="Hentikan Respons AI"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim()}
              className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all shrink-0"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        onStatusChange={(status) => setAiStatus(status)}
      />
    </div>
  );
};
