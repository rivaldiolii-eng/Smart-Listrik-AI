import { Appliance, HouseProfile, PLN_DAYA_PRESETS, CalculationResult, TokenData, TokenSimulationResult } from '../types';

export function getEffectiveTariff(profile: HouseProfile): number {
  if (profile.customTariff && profile.customTariff > 0) {
    return profile.customTariff;
  }
  const match = PLN_DAYA_PRESETS.find((p) => p.va === profile.dayaVA);
  return match ? match.tariff : 1444.7;
}

export function calculateElectricity(appliances: Appliance[], profile: HouseProfile): CalculationResult {
  const effectiveTariff = getEffectiveTariff(profile);

  let totalWattLoad = 0;
  let kwhPerDay = 0;
  let kwhPerMonth = 0;

  const itemStats = appliances.map((app) => {
    const watt = app.watt || 0;
    const qty = app.quantity || 1;
    const hrs = app.hoursPerDay || 0;
    const days = app.daysPerMonth || 30;

    const totalApplianceWatt = watt * qty;
    totalWattLoad += totalApplianceWatt;

    // kWh calculations
    const appKwhDay = (totalApplianceWatt * hrs) / 1000;
    const appKwhMonth = (totalApplianceWatt * hrs * days) / 1000;

    kwhPerDay += appKwhDay;
    kwhPerMonth += appKwhMonth;

    return {
      appliance: app,
      kwhMonth: appKwhMonth,
      costMonth: appKwhMonth * effectiveTariff,
      percentage: 0, // calculated below
    };
  });

  // Calculate percentage per appliance
  const breakdown = itemStats.map((item) => ({
    ...item,
    percentage: kwhPerMonth > 0 ? (item.kwhMonth / kwhPerMonth) * 100 : 0,
  }));

  // Sort top consumers descending
  const sortedTop = [...breakdown].sort((a, b) => b.kwhMonth - a.kwhMonth);

  const kwhPerYear = kwhPerMonth * 12;
  const costPerDay = kwhPerDay * effectiveTariff;
  const costPerMonth = kwhPerMonth * effectiveTariff;
  const costPerYear = kwhPerYear * effectiveTariff;

  const loadPercentage = profile.dayaVA > 0 ? (totalWattLoad / profile.dayaVA) * 100 : 0;
  const isOverCapacity = totalWattLoad > profile.dayaVA;
  const isNearCapacity = loadPercentage >= 80;

  return {
    totalWattLoad,
    loadPercentage,
    isOverCapacity,
    isNearCapacity,
    kwhPerDay,
    kwhPerMonth,
    kwhPerYear,
    costPerDay,
    costPerMonth,
    costPerYear,
    effectiveTariffPerKwh: effectiveTariff,
    applianceBreakdown: breakdown,
    topConsumingAppliances: sortedTop,
  };
}

export function simulateToken(
  tokenData: TokenData,
  profile: HouseProfile,
  dailyKwhDemand: number
): TokenSimulationResult {
  const tariff = getEffectiveTariff(profile);
  const ppjPercent = tokenData.ppjPercent || 3;

  let netNominalRp = tokenData.nominalRp;
  if (tokenData.nominalRp > 0) {
    netNominalRp = tokenData.nominalRp * (1 - ppjPercent / 100);
  }

  // If custom kWh specified directly
  let purchasedKwh = 0;
  if (tokenData.customKwh && tokenData.customKwh > 0) {
    purchasedKwh = tokenData.customKwh;
  } else {
    purchasedKwh = tariff > 0 ? netNominalRp / tariff : 0;
  }

  const activeDailyKwh = dailyKwhDemand > 0 ? dailyKwhDemand : 1; // avoid divide by zero
  const daysDuration = purchasedKwh / activeDailyKwh;
  const hoursDuration = daysDuration * 24;

  const startDate = tokenData.purchaseDate ? new Date(tokenData.purchaseDate) : new Date();
  const expiryTimestamp = startDate.getTime() + daysDuration * 24 * 60 * 60 * 1000;
  const estimatedExpiryDate = new Date(expiryTimestamp);

  const now = new Date();
  const diffTime = estimatedExpiryDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, diffTime / (1000 * 60 * 60 * 24));

  const isLowToken = daysRemaining < 5;

  return {
    netNominalRp,
    purchasedKwh,
    dailyKwh: activeDailyKwh,
    daysDuration,
    hoursDuration,
    estimatedExpiryDate,
    daysRemaining,
    isLowToken,
  };
}
