import React from 'react';
import { Instagram, Sparkles, Heart, Zap, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Powered by */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                Smart Listrik AI
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Powered by <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Ipal AI</strong></span>
            </p>
          </div>

          {/* Developer & Instagram Info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 px-5 py-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs">
              <Code2 className="w-4 h-4 text-indigo-500" />
              <span className="text-zinc-500 dark:text-zinc-400">Developer:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Ripalldi Olii</span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-zinc-300 dark:bg-zinc-800" />

            <a
              href="https://instagram.com/ivalrivky_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-xl border border-pink-500/20 transition-all hover:scale-105 active:scale-95"
              title="Kunjungi Instagram Developer @ivalrivky_"
            >
              <Instagram className="w-4 h-4" />
              <span>@ivalrivky_</span>
            </a>
          </div>

          {/* Copyright & Tagline */}
          <div className="text-center md:text-right text-xs text-zinc-400 dark:text-zinc-500">
            <p>© {new Date().getFullYear()} Smart Listrik AI. All rights reserved.</p>
            <p className="text-[11px] mt-0.5">Solusi cerdas penghematan listrik keluarga Indonesia.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
