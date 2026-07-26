import APP_CONFIG from '../config';
import { loadGeminiApiKey } from '../utils/storage';
import { ContextPayload } from './aiService';

export interface ApiChatRequest {
  prompt: string;
  context: ContextPayload;
  history: Array<{ role: string; text: string }>;
}

export interface ApiChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

/**
 * API Client module for sending AI chat requests via backend endpoints (/api/chat)
 * Keeping API keys safely managed server-side / in user local storage.
 */
export async function sendBackendChat(
  request: ApiChatRequest,
  signal?: AbortSignal
): Promise<string> {
  const userApiKey = loadGeminiApiKey();

  // Primary call to /api/chat
  try {
    const response = await fetch(APP_CONFIG.apiEndpoints.aiChat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        context: request.context,
        history: request.history,
        apiKey: userApiKey || undefined,
      }),
      signal,
    });

    if (response.ok) {
      const data: ApiChatResponse = await response.json();
      if (data.success && data.reply) {
        return data.reply;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  // Fallback call to /api/ai/advisor if /api/chat is unavailable
  try {
    const response = await fetch(APP_CONFIG.apiEndpoints.aiAdvisor, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        context: request.context,
        history: request.history,
        apiKey: userApiKey || undefined,
      }),
      signal,
    });

    if (response.ok) {
      const data: ApiChatResponse = await response.json();
      if (data.success && data.reply) {
        return data.reply;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  // Direct client-side Gemini API fallback for static environments (Netlify / GitHub Pages without backend)
  if (!userApiKey) {
    throw new Error('API Key belum diisi. Silakan tambahkan Google Gemini API Key Anda di menu Pengaturan AI.');
  }

  const userName = request.context.userName || 'Pengguna';
  const systemPrompt = `Nama Anda adalah "Ipal AI", asisten pribadi konsultan energi listrik rumah tangga yang sangat pintar, cerdas, cepat, dan responsif di Indonesia.
Sapa pengguna dengan nama "${userName}". Gunakan bahasa Indonesia yang santai, ramah, dan sopan.

Konteks Lengkap Rumah & Data Listrik (${userName}):
- Nama Pengguna: ${userName}
- Nama Profil Rumah: ${request.context.namaRumah || 'Rumah Utama'}
- Daya Listrik: ${request.context.dayaVA || 1300} VA (${request.context.jenisMeter || 'Prabayar'})
- Jumlah Penghuni: ${request.context.occupants || 4} orang
- Total Peralatan: ${request.context.totalPeralatan || 0} unit
- Total Beban Peralatan: ${request.context.totalWatt || 0} Watt (${request.context.persenBeban || 0}% dari batas daya)
- Total Pemakaian Bulanan: ${request.context.kwhBulan?.toFixed(1) || 0} kWh
- Total Estimasi Biaya Bulanan: Rp ${(request.context.biayaBulan || 0).toLocaleString('id-ID')}
- Skor Efisiensi Rumah: ${request.context.skorEfisiensi || 80}/100 (${request.context.kategoriEfisiensi || 'Normal'})
- Peralatan Paling Boros: ${request.context.topAppliance || 'Belum ada'}
- Data Token Terakhir: Rp ${(request.context.nominalToken || 100000).toLocaleString('id-ID')} (~${request.context.kwhToken || 60} kWh, tahan ~${request.context.hariToken || 10} hari)
Daftar Peralatan Terdaftar:
${request.context.daftarPeralatanStr || '- Belum ada peralatan'}

Jawablah pertanyaan pengguna (${userName}) dengan singkat, spesifik, dan bermanfaat berdasarkan data di atas.`;

  const contents = request.history.map((item) => ({
    role: item.role === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }],
  }));

  contents.push({ role: 'user', parts: [{ text: request.prompt }] });

  const directRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
      signal,
    }
  );

  if (!directRes.ok) {
    const errData = await directRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Gagal terhubung ke Gemini API.');
  }

  const resultJson = await directRes.json();
  const textReply = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textReply) {
    throw new Error('Menerima tanggapan kosong dari Gemini API.');
  }

  return textReply;
}
