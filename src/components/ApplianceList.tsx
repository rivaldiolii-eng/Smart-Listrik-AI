import React, { useState } from 'react';
import { Plus, Search, Copy, Edit2, Trash2, Camera, Mic, Sparkles, Filter, Info, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Appliance, Category } from '../types';
import { APPLIANCE_CATALOG, CatalogItem } from '../data/presets';
import { playClickSound, playSaveSound, playDeleteSound, playMenuOpenSound } from '../utils/audio';

interface ApplianceListProps {
  appliances: Appliance[];
  onAdd: (appliance: Omit<Appliance, 'id'>) => void;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  onDuplicate: (appliance: Appliance) => void;
  onOpenScanLabel: () => void;
  onOpenVoiceInput: () => void;
  onOpenAddModal: () => void;
  effectiveTariff: number;
}

export const ApplianceList: React.FC<ApplianceListProps> = ({
  appliances,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenScanLabel,
  onOpenVoiceInput,
  onOpenAddModal,
  effectiveTariff,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const categories: string[] = ['Semua', 'Pendingin', 'Dapur', 'Hiburan', 'Pencahayaan', 'Kebersihan', 'Kantor', 'Pompa Air', 'Lainnya'];

  const filtered = appliances.filter((app) => {
    const matchesCat = selectedCategory === 'Semua' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddFromCatalog = (item: CatalogItem) => {
    playSaveSound();
    onAdd({
      name: item.name,
      category: item.category,
      watt: item.watt,
      quantity: 1,
      hoursPerDay: item.hoursPerDay,
      daysPerMonth: item.daysPerMonth,
    });
    setAddedNotice(`Menambahkan ${item.name}`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  const handleDelete = (id: string) => {
    playDeleteSound();
    onDelete(id);
  };

  const handleDuplicate = (app: Appliance) => {
    playSaveSound();
    onDuplicate(app);
  };

  const handleCategorySelect = (cat: string) => {
    playClickSound();
    setSelectedCategory(cat);
  };

  const calculateItemCost = (app: Appliance) => {
    const kwh = (app.watt * app.quantity * app.hoursPerDay * app.daysPerMonth) / 1000;
    return kwh * effectiveTariff;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">Daftar Peralatan Listrik</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
            Total {appliances.length} peralatan terdaftar • {appliances.reduce((acc, a) => acc + a.watt * a.quantity, 0)} Watt total beban
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { playMenuOpenSound(); onOpenScanLabel(); }}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Stiker AI</span>
          </button>

          <button
            onClick={() => { playMenuOpenSound(); onOpenVoiceInput(); }}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Input Suara</span>
          </button>

          <button
            onClick={() => { playMenuOpenSound(); onOpenAddModal(); }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Alat Manual</span>
          </button>
        </div>
      </div>

      {/* Quick Catalog Banner Accordion */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">Katalog Cepat Peralatan Umum</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">Klik 1-kali untuk menambahkan peralatan standar ke daftar Anda</p>
            </div>
          </div>
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-zinc-700"
          >
            <span>{showCatalog ? 'Sembunyikan' : 'Buka Katalog'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCatalog ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {addedNotice && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{addedNotice}</span>
          </div>
        )}

        {showCatalog && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {APPLIANCE_CATALOG.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleAddFromCatalog(item)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/80 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    {item.name}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>{item.watt} Watt</span>
                  <span>{item.hoursPerDay} jam/hr</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama peralatan..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Appliances Items Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
          <Info className="w-12 h-12 mx-auto mb-3 opacity-50 text-slate-400 dark:text-zinc-400" />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-200">Tidak ada peralatan ditemukan</h3>
          <p className="text-xs mt-1 text-slate-500 dark:text-zinc-400">Coba sesuaikan kata kunci pencarian atau kategori filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => {
            const kwhMonth = (app.watt * app.quantity * app.hoursPerDay * app.daysPerMonth) / 1000;
            const costMonth = kwhMonth * effectiveTariff;

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 mb-1">
                        {app.category}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 leading-snug">
                        {app.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDuplicate(app)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Duplikat Peralatan"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { playMenuOpenSound(); onEdit(app); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        title="Edit Peralatan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Hapus Peralatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400">Daya & Jumlah</span>
                      <strong className="text-slate-900 dark:text-zinc-200 font-bold">
                        {app.watt}W × {app.quantity} unit ({app.watt * app.quantity}W)
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400">Waktu Pakai</span>
                      <strong className="text-slate-900 dark:text-zinc-200 font-bold">
                        {app.hoursPerDay} jam/hr ({app.daysPerMonth} hr/bln)
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Konsumsi: </span>
                    <strong className="text-slate-800 dark:text-zinc-300 font-bold">{kwhMonth.toFixed(1)} kWh/bln</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                      Rp {Math.round(costMonth).toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-zinc-400">/bulan</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
