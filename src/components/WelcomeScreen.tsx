import React, { useState } from 'react';
import { Zap, Sparkles, ArrowRight, ShieldCheck, Cpu, BarChart3, HeartHandshake } from 'lucide-react';
import { playSaveSound, playClickSound } from '../utils/audio';

interface WelcomeScreenProps {
  onComplete: (userName: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setErrorMsg('Nama wajib diisi dan tidak boleh kosong.');
      return;
    }

    if (trimmed.length < 2) {
      setErrorMsg('Nama minimal harus 2 karakter.');
      return;
    }

    if (trimmed.length > 30) {
      setErrorMsg('Nama maksimal 30 karakter.');
      return;
    }

    playSaveSound();
    onComplete(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 dark:bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative transition-all my-auto">
        {/* Decorative Background Lighting Blur */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 sm:p-10 relative z-10 flex flex-col items-center text-center">
          {/* Logo Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-600/30 mb-6 group hover:scale-105 transition-transform">
            <Zap className="w-10 h-10 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Listrik AI • Ipal AI Engine</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Selamat Datang di Smart Listrik AI ⚡
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-8 max-w-md">
            Aplikasi pintar untuk menghitung konsumsi listrik rumah, memperkirakan biaya, dan mendapatkan rekomendasi hemat listrik dari Ipal AI.
          </p>

          {/* Key Feature Highlights Pill Badges */}
          <div className="grid grid-cols-3 gap-2 w-full mb-8">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Simulasi Token</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Smart Analytics</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300">Ipal AI Advisor</span>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="w-full text-left space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 dark:text-zinc-200 mb-2">
                Siapa nama kamu?
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Masukkan nama kamu..."
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-inner"
              />
              {errorMsg && (
                <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              onClick={() => playClickSound()}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Mulai Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-6 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Data nama Anda tersimpan aman di Local Storage browser tanpa login
          </p>
        </div>
      </div>
    </div>
  );
};
