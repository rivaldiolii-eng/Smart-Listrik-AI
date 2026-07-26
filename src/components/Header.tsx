import React from 'react';
import { Zap, Moon, Sun, Settings, Sparkles, Home, Cpu, PieChart, Layers, ShieldAlert, BarChart3 } from 'lucide-react';
import { HouseProfile, ThemeSettings } from '../types';
import { playClickSound, playTabSwitchSound } from '../utils/audio';

interface HeaderProps {
  activeTab: 'dashboard' | 'appliances' | 'simulator' | 'charts' | 'ai';
  setActiveTab: (tab: 'dashboard' | 'appliances' | 'simulator' | 'charts' | 'ai') => void;
  profile: HouseProfile;
  theme: ThemeSettings;
  setTheme: React.Dispatch<React.SetStateAction<ThemeSettings>>;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  isOverCapacity: boolean;
  isNearCapacity: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  theme,
  setTheme,
  onOpenSettings,
  onOpenProfile,
  isOverCapacity,
  isNearCapacity,
}) => {
  const toggleDarkMode = () => {
    playClickSound();
    setTheme((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const handleTabChange = (tab: 'dashboard' | 'appliances' | 'simulator' | 'charts' | 'ai') => {
    playTabSwitchSound();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl flex items-center justify-center shadow-lg bg-indigo-600 text-white">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400">
                  Smart Listrik AI
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Ipal AI Powered
                </span>
              </div>
              <button 
                onClick={() => { playClickSound(); onOpenProfile(); }}
                className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>{profile.name} ({profile.dayaVA} VA • {profile.meterType})</span>
                <span className="underline text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">(Ubah)</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleTabChange('appliances')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'appliances'
                  ? 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Peralatan</span>
            </button>

            <button
              onClick={() => handleTabChange('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Simulasi Token</span>
            </button>

            <button
              onClick={() => handleTabChange('charts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'charts'
                  ? 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Grafik Analisis</span>
            </button>

            <button
              onClick={() => handleTabChange('ai')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ipal AI Advisor</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Alert Status Indicator */}
            {(isOverCapacity || isNearCapacity) && (
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse ${
                  isOverCapacity 
                    ? 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30' 
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                }`}
                title={isOverCapacity ? 'Beban melebihi kapasitas daya rumah!' : 'Beban listrik mendekati kapasitas (>80%)'}
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isOverCapacity ? 'Overload VA' : '> 80% Daya'}
                </span>
              </div>
            )}

            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-zinc-800"
              title={theme.darkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Mode Gelap'}
            >
              {theme.darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Settings button */}
            <button
              onClick={() => { playClickSound(); onOpenSettings(); }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-zinc-800"
              title="Pengaturan Aplikasi"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800 px-2 py-1.5 shadow-xl">
        <div className="grid grid-cols-5 gap-1 text-center">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`flex flex-col items-center py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => handleTabChange('appliances')}
            className={`flex flex-col items-center py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'appliances' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span>Alat</span>
          </button>

          <button
            onClick={() => handleTabChange('simulator')}
            className={`flex flex-col items-center py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'simulator' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Cpu className="w-5 h-5 mb-0.5" />
            <span>Token</span>
          </button>

          <button
            onClick={() => handleTabChange('charts')}
            className={`flex flex-col items-center py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'charts' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <PieChart className="w-5 h-5 mb-0.5" />
            <span>Grafik</span>
          </button>

          <button
            onClick={() => handleTabChange('ai')}
            className={`flex flex-col items-center py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'ai' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ipal AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
