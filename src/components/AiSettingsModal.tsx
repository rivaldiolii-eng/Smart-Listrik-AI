import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, ShieldCheck, Check, AlertTriangle, RefreshCw, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import { loadGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey, checkAiStatus, AiStatus } from '../services/aiService';
import { playClickSound, playSaveSound, playDeleteSound, playModalCloseSound } from '../utils/audio';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: AiStatus) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [status, setStatus] = useState<AiStatus>('unconfigured');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchStatus = async (keyToCheck?: string) => {
    setIsTesting(true);
    const result = await checkAiStatus(keyToCheck);
    setStatus(result.status);
    if (onStatusChange) onStatusChange(result.status);
    setIsTesting(false);
    return result;
  };

  useEffect(() => {
    if (isOpen) {
      const stored = loadGeminiApiKey();
      setApiKey(stored);
      setNotice(null);
      fetchStatus(stored);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();

    if (!trimmed) {
      removeGeminiApiKey();
      playDeleteSound();
      setNotice({ type: 'info', text: 'API Key dihapus. Ipal AI akan menggunakan kunci server default.' });
      const res = await fetchStatus('');
      return;
    }

    saveGeminiApiKey(trimmed);
    playSaveSound();
    setNotice({ type: 'info', text: 'Menguji koneksi Gemini API...' });

    const res = await fetchStatus(trimmed);
    if (res.status === 'connected') {
      setNotice({ type: 'success', text: 'Berhasil! API Key tersimpan dan Gemini API terhubung dengan lancar.' });
    } else if (res.status === 'unconfigured') {
      setNotice({ type: 'info', text: 'API Key kosong.' });
    } else {
      setNotice({ type: 'error', text: `Gagal terhubung ke Gemini API: ${res.error || 'Periksa kembali API Key Anda.'}` });
    }
  };

  const handleRemove = async () => {
    playDeleteSound();
    removeGeminiApiKey();
    setApiKey('');
    setNotice({ type: 'info', text: 'API Key pengguna berhasil dihapus.' });
    await fetchStatus('');
  };

  const handleTestConnection = async () => {
    playClickSound();
    setNotice({ type: 'info', text: 'Sedang menguji koneksi...' });
    const res = await fetchStatus(apiKey);
    if (res.status === 'connected') {
      setNotice({ type: 'success', text: '🟢 Koneksi Gemini API sukses & siap digunakan!' });
    } else {
      setNotice({ type: 'error', text: `🔴 Koneksi gagal: ${res.error || 'API Key tidak valid atau jaringan offline.'}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Pengaturan Google Gemini API ⚡
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Kelola API Key untuk mesin Ipal AI
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playModalCloseSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Indicator Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Status Koneksi AI
              </span>
              <div className="flex items-center gap-2 mt-1">
                {status === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    🟢 Gemini Terhubung
                  </span>
                )}
                {status === 'unconfigured' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    🟡 API Key Belum Diisi
                  </span>
                )}
                {status === 'failed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    🔴 Gagal Terhubung
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Uji Ulang Koneksi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="hidden sm:inline">Uji</span>
            </button>
          </div>

          {/* Feedback Notice Alert */}
          {notice && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium border flex items-start gap-2.5 ${
                notice.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200'
                  : notice.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 text-indigo-800 dark:text-indigo-200'
              }`}
            >
              {notice.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : notice.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{notice.text}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2">
                Google Gemini API Key
              </label>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Masukkan Google Gemini API Key Anda (mis. AIzaSy...)"
                  className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                  title={showKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Dapatkan API Key Gratis</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tersimpan di Local Storage
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan & Menguji...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan API Key</span>
                  </>
                )}
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  title="Hapus API Key"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
