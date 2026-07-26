import React, { useState } from 'react';
import { X, Home, Zap, Users, MapPin, Check, Calculator } from 'lucide-react';
import { HouseProfile, MeterType, PLN_DAYA_PRESETS, PROVINCES_INDONESIA } from '../types';
import { playSaveSound, playModalCloseSound, playClickSound } from '../utils/audio';

interface HouseProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: HouseProfile;
  onSave: (updated: HouseProfile) => void;
}

export const HouseProfileModal: React.FC<HouseProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<HouseProfile>({ ...profile });
  const [isCustomDaya, setIsCustomDaya] = useState(
    !PLN_DAYA_PRESETS.some((p) => p.va === profile.dayaVA)
  );

  if (!isOpen) return null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSaveSound();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-indigo-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">Profil Listrik Rumah</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Sesuaikan kapasitas daya dan lokasi rumah Anda</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Nama Rumah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Nama / Identifier Rumah
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-400 dark:placeholder-zinc-500"
              placeholder="Contoh: Rumah Utama / Sektor 5"
            />
          </div>

          {/* Jenis Meter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Jenis Meteran Listrik
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Prabayar', 'Pascabayar'] as MeterType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFormData({ ...formData, meterType: type })}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    formData.meterType === type
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {type === 'Prabayar' ? 'Prabayar (Token Strum)' : 'Pascabayar (Tagihan)'}
                  {formData.meterType === type && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Daya Rumah VA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Daya Terpasang (VA)
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDaya(!isCustomDaya)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                {isCustomDaya ? 'Gunakan Pilihan Preset' : 'Input Manual Daya'}
              </button>
            </div>

            {isCustomDaya ? (
              <input
                type="number"
                min="100"
                max="50000"
                value={formData.dayaVA}
                onChange={(e) => setFormData({ ...formData, dayaVA: Number(e.target.value) || 1300 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                placeholder="Masukkan daya dalam VA (contoh: 1300)"
              />
            ) : (
              <select
                value={formData.dayaVA}
                onChange={(e) => setFormData({ ...formData, dayaVA: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                {PLN_DAYA_PRESETS.map((p) => (
                  <option key={p.va} value={p.va}>
                    {p.label} - Rp {p.tariff}/kWh
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Custom Tariff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Tarif Kustom per kWh (Opsional, isi 0 untuk tarif resmi PLN)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-zinc-400">Rp</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.customTariff}
                onChange={(e) => setFormData({ ...formData, customTariff: Number(e.target.value) || 0 })}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                placeholder="0 (Otomatis tarif PLN sesuai VA)"
              />
            </div>
          </div>

          {/* Grid Occupants & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Jumlah Penghuni
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.occupants}
                onChange={(e) => setFormData({ ...formData, occupants: Number(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Provinsi
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              >
                {PROVINCES_INDONESIA.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Kota / Kabupaten
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-400 dark:placeholder-zinc-500"
              placeholder="Contoh: Jakarta Selatan / Bandung"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-colors"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
