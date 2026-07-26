export type MeterType = 'Prabayar' | 'Pascabayar';

export type Category = 
  | 'Pendingin'
  | 'Dapur'
  | 'Hiburan'
  | 'Pencahayaan'
  | 'Kebersihan'
  | 'Kantor'
  | 'Pompa Air'
  | 'Lainnya';

export interface Appliance {
  id: string;
  name: string;
  category: Category;
  watt: number;
  quantity: number;
  hoursPerDay: number;
  daysPerMonth: number;
}

export interface HouseProfile {
  name: string;
  meterType: MeterType;
  dayaVA: number;
  customTariff: number; // 0 means use PLN default for dayaVA
  occupants: number;
  province: string;
  city: string;
}

export interface TokenData {
  nominalRp: number;
  customKwh?: number;
  ppjPercent: number; // Pajak Penerangan Jalan (usually 3% - 10%)
  purchaseDate: string; // ISO date string
  kwhRemaining?: number;
}

export interface ThemeSettings {
  darkMode: boolean;
  accentColor: 'emerald' | 'blue' | 'amber' | 'violet';
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface CalculationResult {
  totalWattLoad: number;
  loadPercentage: number;
  isOverCapacity: boolean;
  isNearCapacity: boolean; // >80%
  kwhPerDay: number;
  kwhPerMonth: number;
  kwhPerYear: number;
  costPerDay: number;
  costPerMonth: number;
  costPerYear: number;
  effectiveTariffPerKwh: number;
  applianceBreakdown: Array<{
    appliance: Appliance;
    kwhMonth: number;
    costMonth: number;
    percentage: number;
  }>;
  topConsumingAppliances: Array<{
    appliance: Appliance;
    kwhMonth: number;
    percentage: number;
  }>;
}

export interface TokenSimulationResult {
  netNominalRp: number;
  purchasedKwh: number;
  dailyKwh: number;
  daysDuration: number;
  hoursDuration: number;
  estimatedExpiryDate: Date;
  daysRemaining: number;
  isLowToken: boolean; // < 5 days
}

export const PLN_DAYA_PRESETS = [
  { va: 450, tariff: 415, label: '450 VA (Subsidized)' },
  { va: 900, tariff: 1352, label: '900 VA (R-1/900)' },
  { va: 1300, tariff: 1444.7, label: '1.300 VA (R-1/TR)' },
  { va: 2200, tariff: 1444.7, label: '2.200 VA (R-1/TR)' },
  { va: 3500, tariff: 1699.53, label: '3.500 VA (R-2/TR)' },
  { va: 4400, tariff: 1699.53, label: '4.400 VA (R-2/TR)' },
  { va: 5500, tariff: 1699.53, label: '5.500 VA (R-2/TR)' },
  { va: 6600, tariff: 1700.0, label: '6.600 VA (R-3/TR)' },
  { va: 7700, tariff: 1700.0, label: '7.700 VA (R-3/TR)' },
  { va: 11000, tariff: 1700.0, label: '11.000 VA (R-3/TR)' },
  { va: 22000, tariff: 1700.0, label: '22.000 VA (B-2/TR)' },
];

export const PROVINCES_INDONESIA = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten',
  'DI Yogyakarta', 'Bali', 'Sumatera Utara', 'Sumatera Selatan', 'Riau',
  'Lampung', 'Kalimantan Timur', 'Kalimantan Barat', 'Sulawesi Selatan', 'Sulawesi Utara'
];
