/**
 * Configuration Module for Smart Listrik AI
 * Contains application constants, version, and API endpoint definitions.
 * DO NOT store API Keys in this file.
 */

export const APP_CONFIG = {
  appName: 'Smart Listrik AI',
  appVersion: '1.0.0',
  author: 'Smart Listrik AI Team',
  defaultTheme: {
    darkMode: true,
    accentColor: 'indigo' as const,
  },
  apiEndpoints: {
    aiChat: '/api/chat',
    aiAdvisor: '/api/ai/advisor',
    aiStatus: '/api/ai/status',
  },
  defaultTariffPerKwh: 1444.7, // Tariff PLN R-1/TR 1300 VA
  localStorageKeys: {
    PROFILE: 'smart_listrik_profile_v1',
    APPLIANCES: 'smart_listrik_appliances_v1',
    TOKEN: 'smart_listrik_token_v1',
    THEME: 'smart_listrik_theme_v1',
    AI_CHAT: 'smart_listrik_ai_chat_v1',
    USER_NAME: 'smart_listrik_user_name_v1',
    ONBOARDED: 'smart_listrik_onboarded_v1',
    GEMINI_KEY: 'smart_listrik_gemini_api_key_v1',
    SOUND: 'smart_listrik_sound_settings_v1',
  },
} as const;

export default APP_CONFIG;
