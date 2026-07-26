import { loadGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey } from '../utils/storage';
import { sendBackendChat } from './apiClient';

export type AiStatus = 'connected' | 'unconfigured' | 'failed';

export interface AiStatusResult {
  status: AiStatus;
  message: string;
  error?: string;
}

export interface ContextPayload {
  userName?: string;
  namaRumah?: string;
  dayaVA?: number;
  jenisMeter?: string;
  occupants?: number;
  totalPeralatan?: number;
  totalWatt?: number;
  persenBeban?: number;
  kwhBulan?: number;
  biayaBulan?: number;
  biayaTahun?: number;
  skorEfisiensi?: number;
  kategoriEfisiensi?: string;
  topAppliance?: string;
  leastAppliance?: string;
  nominalToken?: number;
  kwhToken?: number;
  hariToken?: number;
  daftarPeralatanStr?: string;
  simulasiStr?: string;
}

/**
  * Check the current connection status of Google Gemini API
  */
export async function checkAiStatus(customKey?: string): Promise<AiStatusResult> {
  const apiKey = customKey !== undefined ? customKey : loadGeminiApiKey();

  try {
    const response = await fetch('/api/ai/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'connected') {
        return { status: 'connected', message: 'Gemini Terhubung' };
      } else if (data.status === 'unconfigured') {
        return { status: 'unconfigured', message: 'API Key Belum Diisi' };
      } else {
        return { status: 'failed', message: 'Gagal Terhubung', error: data.error };
      }
    }
  } catch (err: any) {
    // Ignore server error and fallback to direct client-side key check
  }

  // Static fallback check
  if (!apiKey) {
    return { status: 'unconfigured', message: 'API Key Belum Diisi' };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping' }] }],
        }),
      }
    );

    if (res.ok) {
      return { status: 'connected', message: 'Gemini Terhubung' };
    } else {
      const errorData = await res.json().catch(() => ({}));
      return {
        status: 'failed',
        message: 'Gagal Terhubung',
        error: errorData.error?.message || 'API Key Gemini tidak valid atau kuota habis.',
      };
    }
  } catch (e: any) {
    return { status: 'failed', message: 'Gagal Terhubung', error: 'Koneksi jaringan terputus.' };
  }
}

/**
  * Send prompt message to Ipal AI Advisor with full user context via backend API client
  */
export async function sendIpalAiMessage(
  prompt: string,
  context: ContextPayload,
  history: Array<{ role: string; text: string }>,
  signal?: AbortSignal
): Promise<string> {
  return sendBackendChat({ prompt, context, history }, signal);
}

export { loadGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey };
