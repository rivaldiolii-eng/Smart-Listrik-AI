import React, { useState, useEffect } from 'react';
import { X, Layers, Zap, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { Appliance, Category } from '../types';
import { playSaveSound, playModalCloseSound } from '../utils/audio';

interface ApplianceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  applianceToEdit?: Appliance | null;
  onSave: (applianceData: Omit<Appliance, 'id'> | Appliance) => void;
}

export const ApplianceFormModal: React.FC<ApplianceFormModalProps> = ({
  isOpen,
  onClose,
  applianceToEdit,
  onSave,
}) => {
  const categories: Category[] = [
    'Pendingin',
    'Dapur',
    'Hiburan',
    'Pencahayaan',
    'Kebersihan',
    'Kantor',
    'Pompa Air',
    'Lainnya',
  ];

  const [formData, setFormData] = useState<Omit<Appliance, 'id'>>({
    name: '',
    category: 'Pendingin',
    watt: 100,
    quantity: 1,
    hoursPerDay: 8,
    daysPerMonth: 30,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
    if (applianceToEdit) {
      setFormData({
        name: applianceToEdit.name,
        category: applianceToEdit.category,
        watt: applianceToEdit.watt,
        quantity: applianceToEdit.quantity,
        hoursPerDay: applianceToEdit.hoursPerDay,
        daysPerMonth: applianceToEdit.daysPerMonth,
      });
    } else {
      setFormData({
        name: '',
        category: 'Pendingin',
        watt: 100,
        quantity: 1,
        hoursPerDay: 8,
        daysPerMonth: 30,
      });
    }
  }, [applianceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Nama peralatan tidak boleh kosong.');
      return;
    }

    if (formData.watt <= 0) {
      setValidationError('Daya listrik (Watt) harus lebih dari 0.');
      return;
    }

    if (formData.quantity < 1) {
      setValidationError('Jumlah unit minimal 1.');
      return;
    }

    if (formData.hoursPerDay <= 0 || formData.hoursPerDay > 24) {
      setValidationError('Jam pakai per hari harus antara 0.1 sampai 24 jam.');
      return;
    }

    if (formData.daysPerMonth < 1 || formData.daysPerMonth > 31) {
      setValidationError('Hari pakai per bulan harus antara 1 sampai 31 hari.');
      return;
    }

    setValidationError(null);
    playSaveSound();
    if (applianceToEdit) {
      onSave({
        ...applianceToEdit,
        ...formData,
      });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-indigo-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">
                {applianceToEdit ? 'Edit Peralatan Listrik' : 'Tambah Peralatan Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Masukkan spesifikasi watt dan pola jam pemakaian</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Nama Alat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Nama Peralatan
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setValidationError(null);
                setFormData({ ...formData, name: e.target.value });
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder-slate-400 dark:placeholder-zinc-500"
              placeholder="Contoh: AC Inverter 1 PK / Kulkas 2 Pintu"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Daya Watt & Jumlah Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Daya Listrik (Watt)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="50000"
                  value={formData.watt || ''}
                  onChange={(e) => {
                    setValidationError(null);
                    setFormData({ ...formData, watt: Math.max(0, Number(e.target.value)) });
                  }}
                  className="w-full px-4 py-2.5 pr-8 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-zinc-400 font-bold">W</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Jumlah Unit
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={formData.quantity || ''}
                onChange={(e) => {
                  setValidationError(null);
                  setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) });
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Jam per hari & Hari per bulan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Jam Pakai / Hari
              </label>
              <input
                type="number"
                required
                min="0.1"
                max="24"
                step="0.5"
                value={formData.hoursPerDay || ''}
                onChange={(e) => {
                  setValidationError(null);
                  setFormData({ ...formData, hoursPerDay: Number(e.target.value) });
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Hari Pakai / Bulan
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.daysPerMonth || ''}
                onChange={(e) => {
                  setValidationError(null);
                  setFormData({ ...formData, daysPerMonth: Number(e.target.value) });
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Quick calculation preview box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-xs">
            <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
              Estimasi Konsumsi Alat
            </span>
            <div className="flex justify-between items-center">
              <span className="text-slate-800 dark:text-zinc-300 font-medium">
                {(
                  (formData.watt * formData.quantity * formData.hoursPerDay * formData.daysPerMonth) /
                  1000
                ).toFixed(1)}{' '}
                kWh / bulan
              </span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                Total {formData.watt * formData.quantity} W
              </strong>
            </div>
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{applianceToEdit ? 'Simpan Perubahan' : 'Tambah Peralatan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
