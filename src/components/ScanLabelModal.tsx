import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { Appliance, Category } from '../types';
import { playClickSound, playSaveSound, playModalCloseSound, playAiDoneSound } from '../utils/audio';

interface ScanLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
}

export const ScanLabelModal: React.FC<ScanLabelModalProps> = ({
  isOpen,
  onClose,
  onAddAppliance,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{
    namaPeralatan: string;
    kategori: Category;
    dayaWatt: number;
    jamEstimasi: number;
    catatan: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClickSound();
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setScannedResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    playClickSound();
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/scan-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setScannedResult({
          namaPeralatan: data.data.namaPeralatan || 'Peralatan Hasil Scan',
          kategori: (data.data.kategori as Category) || 'Lainnya',
          dayaWatt: Number(data.data.dayaWatt) || 100,
          jamEstimasi: Number(data.data.jamEstimasi) || 8,
          catatan: data.data.catatan || 'Berhasil diidentifikasi oleh Ipal AI Vision',
        });
        playAiDoneSound();
      } else {
        throw new Error(data.error || 'Gagal mengekstrak teks spesifikasi dari gambar.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memindai foto stiker daya.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyResult = () => {
    if (!scannedResult) return;

    playSaveSound();
    onAddAppliance({
      name: scannedResult.namaPeralatan,
      category: scannedResult.kategori,
      watt: scannedResult.dayaWatt,
      quantity: 1,
      hoursPerDay: scannedResult.jamEstimasi,
      daysPerMonth: 30,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100">Ipal AI Vision Scan Stiker Daya</h3>
              <p className="text-xs text-zinc-400">Unggah/foto label spesifikasi watt peralatan Anda</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => { playClickSound(); fileInputRef.current?.click(); }}
              className="border-2 border-dashed border-zinc-800 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-zinc-950/50 group"
            >
              <div className="p-4 rounded-full bg-indigo-600/20 text-indigo-400 w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-zinc-100">
                Pilih atau Ambil Foto Stiker Watt
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Format: JPG, PNG, WEBP (Sertakan bagian informasi Volt & Watt yang jelas)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 max-h-56 bg-zinc-950 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Preview Stiker"
                  className="max-h-56 object-contain"
                />
                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedImage(null);
                    setScannedResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-zinc-900/90 text-white hover:bg-zinc-800 transition-colors border border-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!scannedResult && !isAnalyzing && (
                <button
                  onClick={handleAnalyze}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analisis Foto dengan Ipal AI Vision</span>
                </button>
              )}

              {isAnalyzing && (
                <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-center space-y-2">
                  <Loader2 className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
                  <p className="font-bold text-sm text-zinc-100">
                    Memindai stiker spesifikasi dengan Ipal AI...
                  </p>
                  <p className="text-xs text-zinc-400">Mengekstrak daya (Watt), Voltase, dan kategori produk</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Scanned Result Display */}
              {scannedResult && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Hasil Deteksi Spesifikasi Ipal AI:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Nama Alat:</span>
                      <strong className="text-zinc-100">{scannedResult.namaPeralatan}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Kategori:</span>
                      <strong className="text-zinc-100">{scannedResult.kategori}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Daya Listrik:</span>
                      <strong className="text-indigo-400 text-sm font-extrabold">{scannedResult.dayaWatt} Watt</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Estimasi Jam/Hari:</span>
                      <strong className="text-zinc-100">{scannedResult.jamEstimasi} Jam</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 italic border-t border-zinc-800 pt-2">
                    "{scannedResult.catatan}"
                  </p>

                  <button
                    onClick={handleApplyResult}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Tambahkan Alat Ini ke Daftar Saya</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
