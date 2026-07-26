import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Appliance, Category } from '../types';
import { playClickSound, playSaveSound, playModalCloseSound, playAiDoneSound } from '../utils/audio';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onAddAppliance,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<{
    name: string;
    category: Category;
    watt: number;
    hoursPerDay: number;
    quantity: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setParsedResult(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const parseSpokenText = (text: string) => {
    const lower = text.toLowerCase();

    // Watt extraction (e.g. "750 watt", "350w", "100 watt")
    const wattMatch = lower.match(/(\d+)\s*(watt|w\b)/);
    const watt = wattMatch ? parseInt(wattMatch[1], 10) : 100;

    // Hours extraction (e.g. "8 jam", "24 jam")
    const hoursMatch = lower.match(/(\d+)\s*(jam|hours)/);
    const hoursPerDay = hoursMatch ? parseInt(hoursMatch[1], 10) : 8;

    // Quantity extraction (e.g. "jumlah 2", "2 unit", "2 buah")
    const qtyMatch = lower.match(/(jumlah|unit|buah)\s*(\d+)/) || lower.match(/(\d+)\s*(unit|buah)/);
    const quantity = qtyMatch ? parseInt(qtyMatch[1] || qtyMatch[2], 10) : 1;

    // Category detection
    let category: Category = 'Lainnya';
    if (lower.includes('ac') || lower.includes('kipas') || lower.includes('pendingin')) category = 'Pendingin';
    else if (lower.includes('kulkas') || lower.includes('rice cooker') || lower.includes('magic com') || lower.includes('dapur') || lower.includes('oven')) category = 'Dapur';
    else if (lower.includes('tv') || lower.includes('televisi') || lower.includes('speaker') || lower.includes('ps') || lower.includes('game')) category = 'Hiburan';
    else if (lower.includes('lampu') || lower.includes('led') || lower.includes('bohlam')) category = 'Pencahayaan';
    else if (lower.includes('setrika') || lower.includes('cuci') || lower.includes('vacuum')) category = 'Kebersihan';
    else if (lower.includes('laptop') || lower.includes('pc') || lower.includes('komputer')) category = 'Kantor';
    else if (lower.includes('pompa') || lower.includes('air')) category = 'Pompa Air';

    // Clean name
    let name = text
      .replace(/tambah(kan)?/gi, '')
      .replace(/daya\s*\d+\s*watt/gi, '')
      .replace(/\d+\s*watt/gi, '')
      .replace(/\d+\s*jam/gi, '')
      .replace(/pemakaian/gi, '')
      .replace(/selama/gi, '')
      .replace(/jumlah\s*\d+/gi, '')
      .trim();

    if (!name) name = 'Peralatan Suara';

    setParsedResult({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      category,
      watt,
      hoursPerDay: Math.min(24, Math.max(1, hoursPerDay)),
      quantity,
    });
    playAiDoneSound();
  };

  const startSpeechRecognition = () => {
    playClickSound();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Browser Anda belum mendukung Web Speech API. Menggunakan mode simulasi contoh ucapan Ipal AI.');
      simulateSampleVoice();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID'; // Bahasa Indonesia
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        setTranscript(resultText);
        parseSpokenText(resultText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setErrorMsg(`Gagal merekam suara: ${event.error}. Mencoba contoh...`);
        simulateSampleVoice();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      console.error(e);
      setIsListening(false);
      simulateSampleVoice();
    }
  };

  const simulateSampleVoice = () => {
    playClickSound();
    const samples = [
      'Tambah AC 1 PK daya 750 Watt pemakaian 8 jam',
      'Tambah Kulkas 2 Pintu daya 120 Watt jumlah 1 pakai 24 jam',
      'Tambah Lampu LED Teras daya 15 Watt pakai 10 jam',
      'Tambah PC Gaming daya 400 Watt pemakaian 6 jam',
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setTranscript(picked);
    parseSpokenText(picked);
  };

  const handleApply = () => {
    if (!parsedResult) return;

    playSaveSound();
    onAddAppliance({
      name: parsedResult.name,
      category: parsedResult.category,
      watt: parsedResult.watt,
      quantity: parsedResult.quantity,
      hoursPerDay: parsedResult.hoursPerDay,
      daysPerMonth: 30,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100">Ipal AI Voice Assistant</h3>
              <p className="text-xs text-zinc-400">Ucapkan perintah input alat dalam Bahasa Indonesia</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          {/* Mic Button Pulse */}
          <div className="relative inline-block">
            {isListening && (
              <span className="absolute -inset-3 rounded-full bg-indigo-500/30 animate-ping" />
            )}
            <button
              onClick={startSpeechRecognition}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 ${
                isListening ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {isListening ? 'Ipal AI sedang mendengarkan...' : 'Tekan Tombol Mikrofon untuk Bicara'}
            </span>
            <p className="text-xs text-zinc-400 italic max-w-xs mx-auto">
              Contoh ucapan: "Tambah AC 1 PK daya 750 Watt pemakaian 8 jam"
            </p>
          </div>

          {/* Transcript display */}
          {transcript && (
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-left">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Teks Ucapan Terdeteksi:
              </span>
              <p className="text-xs font-semibold text-zinc-200 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Output Card */}
          {parsedResult && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-indigo-500/30 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Ekstraksi Perintah Ipal AI
                </span>
                <button
                  onClick={simulateSampleVoice}
                  className="text-[11px] underline flex items-center gap-1 hover:opacity-80"
                >
                  <RefreshCw className="w-3 h-3" /> Acak Contoh
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-zinc-400 text-[10px] block">Nama Alat:</span>
                  <strong className="text-zinc-100">{parsedResult.name}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Kategori:</span>
                  <strong className="text-zinc-100">{parsedResult.category}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Daya Listrik:</span>
                  <strong className="text-indigo-400 font-extrabold">{parsedResult.watt} Watt</strong>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Durasi Pemakaian:</span>
                  <strong className="text-zinc-100">{parsedResult.hoursPerDay} Jam/Hari</strong>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full mt-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Tambahkan Peralatan Ini</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
