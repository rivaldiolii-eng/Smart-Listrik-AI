import { Appliance, CalculationResult, HouseProfile } from '../types';

export interface EfficiencyResult {
  score: number; // 0 - 100
  category: 'Sangat Hemat' | 'Normal' | 'Boros' | 'Sangat Boros';
  badgeColor: string; // Tailwind class
  badgeBorder: string;
  badgeBg: string;
  emoji: string;
  reasons: string[];
  primaryReason: string;
}

export interface DailyInsight {
  id: string;
  title: string;
  tip: string;
  category: string;
  potentialSavingRp?: number;
  iconType: 'ac' | 'light' | 'fridge' | 'plug' | 'general';
}

export function calculateEfficiencyScore(
  calc: CalculationResult,
  profile: HouseProfile,
  appliances: Appliance[]
): EfficiencyResult {
  let score = 95; // Base starting score
  const reasons: string[] = [];

  // 1. Check Load Capacity Ratio
  const loadPct = calc.loadPercentage;
  if (calc.isOverCapacity) {
    score -= 30;
    reasons.push(
      `Total beban peralatan (${calc.totalWattLoad} Watt) melebihi batas kapasitas PLN (${profile.dayaVA} VA). Berisiko jepret!`
    );
  } else if (loadPct >= 80) {
    score -= 20;
    reasons.push(
      `Beban puncak peralatan mencapai ${loadPct.toFixed(0)}% dari kapasitas ${profile.dayaVA} VA, hampir mendekati batas maksimal.`
    );
  } else if (loadPct >= 65) {
    score -= 10;
    reasons.push(
      `Beban puncak berada di ${loadPct.toFixed(0)}% dari daya ${profile.dayaVA} VA. Cukup aman namun perlu pemantauan.`
    );
  } else {
    reasons.push(
      `Penggunaan daya puncak aman, hanya ${loadPct.toFixed(0)}% dari kapasitas ${profile.dayaVA} VA.`
    );
  }

  // 2. Check Top Consuming Appliance proportion
  const topApp = calc.topConsumingAppliances[0];
  if (topApp && topApp.percentage >= 45) {
    score -= 15;
    reasons.push(
      `Peralatan "${topApp.appliance.name}" menyedot ${topApp.percentage.toFixed(0)}% dari seluruh total tagihan bulanan.`
    );
  }

  // 3. Check High Watt Appliances with Long Usage Hours
  const highPowerLongUse = appliances.filter(
    (a) => a.watt >= 400 && a.hoursPerDay >= 8
  );
  if (highPowerLongUse.length > 0) {
    score -= 10 * Math.min(2, highPowerLongUse.length);
    const names = highPowerLongUse.map((a) => a.name).join(', ');
    reasons.push(
      `Terdapat ${highPowerLongUse.length} alat berdaya tinggi (≥400W) yang dinyalakan ≥8 jam/hari (${names}).`
    );
  }

  // 4. Check total kWh consumption benchmark
  const benchmarkKwh = (profile.dayaVA / 1300) * 280; // Reasonable monthly benchmark
  if (calc.kwhPerMonth > benchmarkKwh * 1.3) {
    score -= 15;
    reasons.push(
      `Total pemakaian (${calc.kwhPerMonth.toFixed(0)} kWh/bulan) di atas rata-rata wajar rumah ${profile.dayaVA} VA (${benchmarkKwh.toFixed(0)} kWh).`
    );
  }

  // Clamp score between 10 and 100
  score = Math.max(10, Math.min(100, Math.round(score)));

  let category: EfficiencyResult['category'] = 'Normal';
  let badgeColor = 'text-amber-400';
  let badgeBorder = 'border-amber-500/30';
  let badgeBg = 'bg-amber-500/10';
  let emoji = '🟡';

  if (score >= 85) {
    category = 'Sangat Hemat';
    badgeColor = 'text-emerald-400';
    badgeBorder = 'border-emerald-500/30';
    badgeBg = 'bg-emerald-500/10';
    emoji = '🟢';
  } else if (score >= 70) {
    category = 'Normal';
    badgeColor = 'text-amber-400';
    badgeBorder = 'border-amber-500/30';
    badgeBg = 'bg-amber-500/10';
    emoji = '🟡';
  } else if (score >= 50) {
    category = 'Boros';
    badgeColor = 'text-orange-400';
    badgeBorder = 'border-orange-500/30';
    badgeBg = 'bg-orange-500/10';
    emoji = '🟠';
  } else {
    category = 'Sangat Boros';
    badgeColor = 'text-red-400';
    badgeBorder = 'border-red-500/30';
    badgeBg = 'bg-red-500/10';
    emoji = '🔴';
  }

  const primaryReason =
    reasons[0] ||
    `Penggunaan listrik rumah berada dalam tingkat efisiensi ${category.toLowerCase()} (${score}/100).`;

  return {
    score,
    category,
    badgeColor,
    badgeBorder,
    badgeBg,
    emoji,
    reasons,
    primaryReason,
  };
}

export function getDailyInsight(
  calc: CalculationResult,
  appliances: Appliance[],
  profile: HouseProfile
): DailyInsight {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const topApp = calc.topConsumingAppliances[0]?.appliance;
  const hasAC = appliances.some((a) => a.name.toLowerCase().includes('ac'));
  const hasFridge = appliances.some((a) =>
    a.name.toLowerCase().includes('kulkas')
  );
  const hasWaterHeater = appliances.some(
    (a) =>
      a.name.toLowerCase().includes('water heater') ||
      a.name.toLowerCase().includes('dispenser')
  );

  const tipsPool: DailyInsight[] = [
    {
      id: 'tip-1',
      title: 'Optimalisasi Penggunaan AC',
      tip: hasAC
        ? `Mengatur suhu AC ke 24°C - 25°C daripada 18°C bisa menghemat hingga 15% konsumsi listrik AC rumahmu!`
        : 'Suhu pendingin ruangan ideal adalah 24°C–25°C. Setiap penurunan 1°C menambah pemakaian listrik ~6%.',
      category: 'Pendingin',
      potentialSavingRp: hasAC ? Math.round(calc.costPerMonth * 0.1) : 45000,
      iconType: 'ac',
    },
    {
      id: 'tip-2',
      title: 'Pencahayaan Hemat LED',
      tip: 'Kalau lampu teras atau ruangan masih memakai lampu bohlam 20W, menggantinya dengan LED 9W bisa menghemat biaya listrik setiap bulan.',
      category: 'Lampu',
      potentialSavingRp: 18000,
      iconType: 'light',
    },
    {
      id: 'tip-3',
      title: 'Karet Pintu Kulkas & Sirkulasi',
      tip: hasFridge
        ? `Pastikan ada jarak minimal 10 cm antara bagian belakang Kulkas dengan dinding agar panas kondensor keluar lancar dan kompresor tidak bekerja berat.`
        : 'Jangan memasukkan makanan panas langsung ke dalam kulkas agar kompresor tidak bekerja ekstra keras.',
      category: 'Dapur',
      potentialSavingRp: 25000,
      iconType: 'fridge',
    },
    {
      id: 'tip-4',
      title: 'Cegah Standby Power (Vampire Load)',
      tip: 'Mencabut steker charger TV, Wi-Fi router saat tidur, atau konsol game yang tidak dipakai dapat menghemat daya standby 5-10 Watt tanpa disadari.',
      category: 'Elektronik',
      potentialSavingRp: 15000,
      iconType: 'plug',
    },
    {
      id: 'tip-5',
      title: 'Dispenser & Water Heater Smart Timer',
      tip: hasWaterHeater
        ? `Gunakan steker timer otomatis pada Dispenser atau Water Heater agar hanya menyala saat jam aktif keluarga (misal 05:00 - 22:00).`
        : 'Peralatan pemanas listrik seperti dispenser menyedot daya besar saat menjaga suhu air tetap panas terus menerus.',
      category: 'Pemanas',
      potentialSavingRp: 35000,
      iconType: 'plug',
    },
    {
      id: 'tip-6',
      title: 'Peralatan Paling Dominan',
      tip: topApp
        ? `Peralatan "${topApp.name}" adalah penyumbang tagihan terbesar di rumahmu. Mengurangi durasi pemakaiannya 1-2 jam per hari akan sangat terasa di dompet.`
        : 'Identifikasi peralatan berdaya watt tinggi dan atur jadwal penggunaan yang teratur.',
      category: 'Saran Khusus',
      potentialSavingRp: Math.round(calc.costPerMonth * 0.12),
      iconType: 'general',
    },
  ];

  const index = dayOfYear % tipsPool.length;
  return tipsPool[index];
}
