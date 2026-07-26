import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Google GenAI client safely
  const getGenAI = (customKey?: string) => {
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan API Key di Pengaturan AI.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API AI Status Check
  app.post('/api/ai/status', async (req, res) => {
    try {
      const { apiKey } = req.body;
      const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

      if (!effectiveKey) {
        return res.json({ status: 'unconfigured', message: 'API Key Belum Diisi' });
      }

      const ai = new GoogleGenAI({
        apiKey: effectiveKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Simple ping call
      await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: 'Ping',
      });

      res.json({ status: 'connected', message: 'Gemini Terhubung' });
    } catch (error: any) {
      console.warn('API /api/ai/status check failed:', error.message);
      res.json({ status: 'failed', error: error.message || 'Gagal Terhubung ke Gemini' });
    }
  });

  // API AI Advisor Chat
  app.post('/api/ai/advisor', async (req, res) => {
    try {
      const { prompt, context, history, apiKey } = req.body;
      const ai = getGenAI(apiKey);

      const userName = context?.userName || 'Pengguna';
      const systemInstruction = `Nama Anda adalah "Ipal AI", asisten pribadi konsultan energi listrik rumah tangga yang sangat pintar, cerdas, cepat, dan responsif di Indonesia.

Karakter & Gaya Komunikasi Ipal AI:
- Sangat pintar, cerdas, cepat, dan memberikan jawaban yang akurat & responsif.
- Ramah, hangat, dan selalu menyapa pengguna dengan nama mereka (seperti "${userName}").
- Gunakan bahasa Indonesia yang santai, sopan, mudah dipahami, dan tidak kaku.
- Berikan analisis berbasis data presisi dari profil rumah pengguna.
- Sebutkan angka watt, kWh, estimasi rupiah, serta nama peralatan listrik secara spesifik.
- Jika pengguna bertanya tentang penurunan tagihan, simulasi alat, atau tambah daya, berikan perhitungan & langkah konkrit.
- Gunakan emoji secukupnya agar percakapan interaktif dan hidup (⚡, 💡, 🔌, 📊, 😊, 🙌, dll).

Konteks Lengkap Rumah & Data Listrik Pengguna (${userName}):
- Nama Pengguna: ${userName}
- Nama Profil Rumah: ${context?.namaRumah || 'Rumah Utama'}
- Daya Listrik: ${context?.dayaVA || 1300} VA (${context?.jenisMeter || 'Prabayar'})
- Jumlah Penghuni: ${context?.occupants || 4} orang
- Total Peralatan: ${context?.totalPeralatan || 0} unit
- Total Beban Peralatan: ${context?.totalWatt || 0} Watt (${context?.persenBeban || 0}% dari batas daya)
- Total Pemakaian Bulanan: ${context?.kwhBulan?.toFixed(1) || 0} kWh
- Total Estimasi Biaya Bulanan: Rp ${(context?.biayaBulan || 0).toLocaleString('id-ID')}
- Total Estimasi Biaya Tahunan: Rp ${(context?.biayaTahun || 0).toLocaleString('id-ID')}
- Skor Efisiensi Rumah: ${context?.skorEfisiensi || 80}/100 (${context?.kategoriEfisiensi || 'Normal'})
- Peralatan Paling Boros: ${context?.topAppliance || 'Belum ada'}
- Peralatan Paling Hemat: ${context?.leastAppliance || 'Belum ada'}
- Data Token Terakhir: Rp ${(context?.nominalToken || 100000).toLocaleString('id-ID')} (~${context?.kwhToken || 60} kWh, diperkirakan tahan ~${context?.hariToken || 10} hari)
${context?.simulasiStr ? `- Data Simulasi Terbaru: ${context.simulasiStr}\n` : ''}
Daftar Peralatan Terdaftar:
${context?.daftarPeralatanStr || '- Belum ada peralatan terdaftar'}

Jawablah pertanyaan pengguna (${userName}) berdasarkan data presisi di atas.`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: prompt || 'Analisis data listrik saya dan berikan saran penghematan terbaik.' }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ success: true, reply: response.text || 'Maaf, tidak ada tanggapan yang dihasilkan.' });
    } catch (error: any) {
      console.error('Error on /api/ai/advisor:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Gagal menghubungi AI Advisor. Pastikan GEMINI_API_KEY valid.',
      });
    }
  });

  // API /api/chat endpoint (backend AI communication proxy)
  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, context, history, apiKey } = req.body;
      const ai = getGenAI(apiKey);

      const userName = context?.userName || 'Pengguna';
      const systemInstruction = `Nama Anda adalah "Ipal AI", asisten pribadi konsultan energi listrik rumah tangga yang sangat pintar, cerdas, cepat, dan responsif di Indonesia.

Karakter & Gaya Komunikasi Ipal AI:
- Sangat pintar, cerdas, cepat, dan memberikan jawaban yang akurat & responsif.
- Ramah, hangat, dan selalu menyapa pengguna dengan nama mereka (seperti "${userName}").
- Gunakan bahasa Indonesia yang santai, sopan, mudah dipahami, dan tidak kaku.
- Berikan analisis berbasis data presisi dari profil rumah pengguna.
- Sebutkan angka watt, kWh, estimasi rupiah, serta nama peralatan listrik secara spesifik.
- Jika pengguna bertanya tentang penurunan tagihan, simulasi alat, atau tambah daya, berikan perhitungan & langkah konkrit.
- Gunakan emoji secukupnya agar percakapan interaktif dan hidup (⚡, 💡, 🔌, 📊, 😊, 🙌, dll).

Konteks Lengkap Rumah & Data Listrik Pengguna (${userName}):
- Nama Pengguna: ${userName}
- Nama Profil Rumah: ${context?.namaRumah || 'Rumah Utama'}
- Daya Listrik: ${context?.dayaVA || 1300} VA (${context?.jenisMeter || 'Prabayar'})
- Jumlah Penghuni: ${context?.occupants || 4} orang
- Total Peralatan: ${context?.totalPeralatan || 0} unit
- Total Beban Peralatan: ${context?.totalWatt || 0} Watt (${context?.persenBeban || 0}% dari batas daya)
- Total Pemakaian Bulanan: ${context?.kwhBulan?.toFixed(1) || 0} kWh
- Total Estimasi Biaya Bulanan: Rp ${(context?.biayaBulan || 0).toLocaleString('id-ID')}
- Total Estimasi Biaya Tahunan: Rp ${(context?.biayaTahun || 0).toLocaleString('id-ID')}
- Skor Efisiensi Rumah: ${context?.skorEfisiensi || 80}/100 (${context?.kategoriEfisiensi || 'Normal'})
- Peralatan Paling Boros: ${context?.topAppliance || 'Belum ada'}
- Peralatan Paling Hemat: ${context?.leastAppliance || 'Belum ada'}
- Data Token Terakhir: Rp ${(context?.nominalToken || 100000).toLocaleString('id-ID')} (~${context?.kwhToken || 60} kWh, diperkirakan tahan ~${context?.hariToken || 10} hari)
${context?.simulasiStr ? `- Data Simulasi Terbaru: ${context.simulasiStr}\n` : ''}
Daftar Peralatan Terdaftar:
${context?.daftarPeralatanStr || '- Belum ada peralatan terdaftar'}

Jawablah pertanyaan pengguna (${userName}) berdasarkan data presisi di atas.`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: prompt || 'Analisis data listrik saya dan berikan saran penghematan terbaik.' }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ success: true, reply: response.text || 'Maaf, tidak ada tanggapan yang dihasilkan.' });
    } catch (error: any) {
      console.error('Error on /api/chat:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Gagal menghubungi AI Server.',
      });
    }
  });

  // API AI Vision Scan Appliance Label
  app.post('/api/ai/scan-label', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'File gambar diperlukan untuk pemindaian.' });
      }

      const ai = getGenAI();

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      };

      const promptText = `Analisis foto stiker spesifikasi/label daya peralatan listrik berikut ini.
Ekstrak informasi penting dan kembalikan HANYA dalam format JSON valid dengan kunci berikut:
{
  "namaPeralatan": "Nama Alat (contoh: AC Inverter 1 PK, Kulkas Sharp, TV Polytron)",
  "kategori": "Salah satu dari: Pendingin, Dapur, Hiburan, Pencahayaan, Kebersihan, Kantor, Pompa Air, Lainnya",
  "dayaWatt": 0 (angka watt spesifikasi),
  "jamEstimasi": 0 (estimasi jam pemakaian wajar per hari dalam angka, misal AC 8, Kulkas 24, TV 5),
  "catatan": "Ringkasan spesifikasi yang terbaca (misal: 220V 50Hz 350W R32)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [imagePart, { text: promptText }],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch (e) {
        console.warn('Failed to parse AI response as JSON:', response.text);
      }

      res.json({ success: true, data: parsed, rawText: response.text });
    } catch (error: any) {
      console.error('Error on /api/ai/scan-label:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Gagal memindai spesifikasi peralatan.',
      });
    }
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Smart Listrik AI running on http://localhost:${PORT}`);
  });
}

startServer();
