import React, { useRef, useState, useEffect } from 'react';
import { X, Settings, Sun, Moon, Palette, Download, Upload, RotateCcw, Check, AlertCircle, Volume2, VolumeX, Music, Play, User, Key, Eye, EyeOff, ShieldCheck, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { ThemeSettings } from '../types';
import { exportBackupData, importBackupData, resetAllData } from '../utils/storage';
import { loadSoundSettings, saveSoundSettings, SoundSettings, playClickSound, playSaveSound, playModalCloseSound, playDeleteSound, playAiDoneSound } from '../utils/audio';
import { loadGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey, checkAiStatus, AiStatus } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeSettings;
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  userName: string;
  onSaveUserName: (newName: string) => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  userName,
  onSaveUserName,
  onDataReload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [soundConfig, setSoundConfig] = useState<SoundSettings>(loadSoundSettings);
  const [nameInput, setNameInput] = useState<string>(userName || '');
  const [nameError, setNameError] = useState<string | null>(null);

  const [geminiKey, setGeminiKey] = useState<string>('');
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>('unconfigured');
  const [isTestingAi, setIsTestingAi] = useState<boolean>(false);

  const testAi = async (key?: string) => {
    setIsTestingAi(true);
    const res = await checkAiStatus(key);
    setAiStatus(res.status);
    setIsTestingAi(false);
  };

  useEffect(() => {
    if (isOpen) {
      setSoundConfig(loadSoundSettings());
      setNameInput(userName || '');
      setNameError(null);
      const key = loadGeminiApiKey();
      setGeminiKey(key);
      testAi(key);
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Nama wajib diisi.');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Nama minimal 2 karakter.');
      return;
    }
    if (trimmed.length > 30) {
      setNameError('Nama maksimal 30 karakter.');
      return;
    }

    playSaveSound();
    onSaveUserName(trimmed);
    setNameError(null);
    setNoticeMsg('Profil nama pengguna berhasil diperbarui!');
    setTimeout(() => setNoticeMsg(null), 3000);
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = geminiKey.trim();
    if (!trimmed) {
      removeGeminiApiKey();
      playDeleteSound();
      setNoticeMsg('API Key dihapus. Menggunakan kunci server default.');
      await testAi('');
      setTimeout(() => setNoticeMsg(null), 3000);
      return;
    }
    saveGeminiApiKey(trimmed);
    playSaveSound();
    setNoticeMsg('API Key Gemini tersimpan!');
    await testAi(trimmed);
    setTimeout(() => setNoticeMsg(null), 3000);
  };

  const handleRemoveGeminiKey = async () => {
    removeGeminiApiKey();
    playDeleteSound();
    setGeminiKey('');
    setNoticeMsg('API Key Gemini berhasil dihapus.');
    await testAi('');
    setTimeout(() => setNoticeMsg(null), 3000);
  };

  const handleToggleSound = () => {
    const updated = { ...soundConfig, enabled: !soundConfig.enabled };
    setSoundConfig(updated);
    saveSoundSettings(updated);
    if (updated.enabled) {
      playClickSound();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updated = { ...soundConfig, volume: val };
    setSoundConfig(updated);
    saveSoundSettings(updated);
  };

  const handleTestSound = () => {
    playAiDoneSound();
  };

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleExport = () => {
    playSaveSound();
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartListrik_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNoticeMsg('Data berhasil diekspor sebagai berkas JSON!');
    setTimeout(() => setNoticeMsg(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = importBackupData(content);
      if (success) {
        playSaveSound();
        onDataReload();
        setNoticeMsg('Data berhasil dipulihkan dari cadangan JSON!');
      } else {
        setNoticeMsg('Gagal memulihkan: Berkas JSON tidak valid.');
      }
      setTimeout(() => setNoticeMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    playDeleteSound();
    if (window.confirm('Apakah Anda yakin ingin mengembalikan aplikasi ke data awal (reset)? Semua daftar alat dan profil kustom akan terhapus.')) {
      resetAllData();
      onDataReload();
      setNoticeMsg('Aplikasi berhasil direset ke data standar.');
      setTimeout(() => setNoticeMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-indigo-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">Pengaturan Aplikasi</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Pengaturan suara, tema, & cadangan data</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {noticeMsg && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{noticeMsg}</span>
            </div>
          )}

          {/* Profil Pengguna Settings */}
          <form onSubmit={handleSaveName} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Profil Pengguna</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Nama Pengguna
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Masukkan nama kamu..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                >
                  Simpan
                </button>
              </div>
              {nameError && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-bold mt-1">
                  ⚠️ {nameError}
                </p>
              )}
            </div>
          </form>

          {/* Pengaturan Google Gemini API */}
          <form onSubmit={handleSaveGeminiKey} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Pengaturan Google Gemini API Key</span>
              </div>

              {/* Status indicator */}
              <span className="text-[10px] font-bold">
                {aiStatus === 'connected' && <span className="text-emerald-600 dark:text-emerald-400">🟢 Gemini Terhubung</span>}
                {aiStatus === 'unconfigured' && <span className="text-amber-600 dark:text-amber-400">🟡 API Key Belum Diisi</span>}
                {aiStatus === 'failed' && <span className="text-red-600 dark:text-red-400">🔴 Gagal Terhubung</span>}
              </span>
            </div>

            <div>
              <div className="relative flex items-center">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Masukkan Google Gemini API Key (AIzaSy...)"
                  className="w-full pl-3 pr-20 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-12 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  title={showGeminiKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="submit"
                  disabled={isTestingAi}
                  className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                >
                  {isTestingAi ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Simpan'}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                <span>Key disimpan aman di Local Storage</span>
                {geminiKey && (
                  <button
                    type="button"
                    onClick={handleRemoveGeminiKey}
                    className="text-red-500 hover:underline font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus Key
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Sound Effect Settings */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Efek Suara (Sound Effect)</span>
              </div>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  soundConfig.enabled
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {soundConfig.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundConfig.enabled ? 'Aktif' : 'Mati'}</span>
              </button>
            </div>

            {soundConfig.enabled && (
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  <span>Volume Suara: {Math.round(soundConfig.volume * 100)}%</span>
                  <button
                    onClick={handleTestSound}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Uji Suara</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundConfig.volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Mode Gelap / Terang */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
              Mode Tampilan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  playClickSound();
                  setTheme((prev) => ({ ...prev, darkMode: false }));
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  !theme.darkMode
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Mode Terang</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setTheme((prev) => ({ ...prev, darkMode: true }));
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme.darkMode
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                    : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400 dark:text-indigo-200" />
                <span>Mode Gelap</span>
              </button>
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              Manajemen Cadangan (Backup & Restore)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-zinc-800"
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  fileInputRef.current?.click();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-zinc-800"
              >
                <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Restore JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Data */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-red-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Seluruh Data Ke Awal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
