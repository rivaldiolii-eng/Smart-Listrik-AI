import { Appliance, HouseProfile, TokenData, ThemeSettings, AiChatMessage } from '../types';
import { SAMPLE_INITIAL_APPLIANCES } from '../data/presets';
import { APP_CONFIG } from '../config';

const STORAGE_KEYS = APP_CONFIG.localStorageKeys;


export const DEFAULT_PROFILE: HouseProfile = {
  name: 'Rumah Utama',
  meterType: 'Prabayar',
  dayaVA: 1300,
  customTariff: 0,
  occupants: 4,
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
};

export const DEFAULT_TOKEN: TokenData = {
  nominalRp: 100000,
  ppjPercent: 3,
  purchaseDate: new Date().toISOString().split('T')[0],
};

export const DEFAULT_THEME: ThemeSettings = {
  darkMode: true,
  accentColor: 'emerald',
};

export function loadUserName(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    if (raw) return raw;
  } catch (e) {
    console.warn('Failed to load user name:', e);
  }
  return '';
}

export function saveUserName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  } catch (e) {
    console.error('Failed to save user name:', e);
  }
}

export function loadIsOnboarded(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDED);
    if (raw === 'true') return true;
    // Check if username is already saved
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    if (name && name.trim().length > 0) return true;
  } catch (e) {
    console.warn('Failed to load onboarded state:', e);
  }
  return false;
}

export function saveIsOnboarded(onboarded: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, onboarded ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save onboarded state:', e);
  }
}

export function loadGeminiApiKey(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY);
    if (raw) return raw;
  } catch (e) {
    console.warn('Failed to load Gemini API key:', e);
  }
  return '';
}

export function saveGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
  } catch (e) {
    console.error('Failed to save Gemini API key:', e);
  }
}

export function removeGeminiApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
  } catch (e) {
    console.error('Failed to remove Gemini API key:', e);
  }
}

export function loadHouseProfile(): HouseProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load profile from localStorage:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveHouseProfile(profile: HouseProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage:', e);
  }
}

export function loadAppliances(): Appliance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLIANCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load appliances from localStorage:', e);
  }
  return SAMPLE_INITIAL_APPLIANCES;
}

export function saveAppliances(appliances: Appliance[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLIANCES, JSON.stringify(appliances));
  } catch (e) {
    console.error('Failed to save appliances to localStorage:', e);
  }
}

export function loadTokenData(): TokenData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (raw) return { ...DEFAULT_TOKEN, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load token data:', e);
  }
  return DEFAULT_TOKEN;
}

export function saveTokenData(token: TokenData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
  } catch (e) {
    console.error('Failed to save token data:', e);
  }
}

export function loadThemeSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load theme settings:', e);
  }
  return DEFAULT_THEME;
}

export function saveThemeSettings(theme: ThemeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
  } catch (e) {
    console.error('Failed to save theme settings:', e);
  }
}

export function loadAiChatHistory(): AiChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CHAT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load AI chat history:', e);
  }
  return [];
}

export function saveAiChatHistory(history: AiChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save AI chat history:', e);
  }
}

export function exportBackupData(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userName: loadUserName(),
    profile: loadHouseProfile(),
    appliances: loadAppliances(),
    token: loadTokenData(),
    theme: loadThemeSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.userName) saveUserName(data.userName);
    if (data.profile) saveHouseProfile(data.profile);
    if (Array.isArray(data.appliances)) saveAppliances(data.appliances);
    if (data.token) saveTokenData(data.token);
    if (data.theme) saveThemeSettings(data.theme);
    return true;
  } catch (e) {
    console.error('Failed to import backup data:', e);
    return false;
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.APPLIANCES);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AI_CHAT);
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
  localStorage.removeItem(STORAGE_KEYS.ONBOARDED);
  saveHouseProfile(DEFAULT_PROFILE);
  saveAppliances(SAMPLE_INITIAL_APPLIANCES);
  saveTokenData(DEFAULT_TOKEN);
}
