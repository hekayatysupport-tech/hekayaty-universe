export interface CharacterStatsInput {
  strength?: number | null;
  speed?: number | null;
  intelligence?: number | null;
  wisdom?: number | null;
  willpower?: number | null;
  magic?: number | null;
}

export interface AbilityInput {
  name?: string;
  arabic_name?: string;
  description?: string | null;
  power_level?: number | null;
}

export interface PowerRatingResult {
  score: number; // 0 - 100
  tier: {
    rank: string;
    titleArabic: string;
    titleEnglish: string;
    color: string;
    glowColor: string;
    badgeBg: string;
  };
  archetype: {
    titleArabic: string;
    titleEnglish: string;
    descriptionArabic: string;
    icon: string;
  };
  metrics: {
    offense: number;
    defense: number;
    agility: number;
    tactics: number;
  };
}

export function calculatePowerRating(
  stats?: CharacterStatsInput | null,
  abilities?: AbilityInput[] | null
): PowerRatingResult {
  const str = stats?.strength ?? 50;
  const spd = stats?.speed ?? 50;
  const int = stats?.intelligence ?? 50;
  const wis = stats?.wisdom ?? 50;
  const wil = stats?.willpower ?? 50;
  const mag = stats?.magic ?? 50;

  const statList = [str, spd, int, wis, wil, mag];
  const statSum = statList.reduce((a, b) => a + b, 0);
  const statAverage = statSum / 6;

  // Max stat spike bonus (specialization mastery)
  const maxStat = Math.max(...statList);
  const minStat = Math.min(...statList);
  const statVarianceBonus = (maxStat - statAverage) * 0.12;

  // Ability synergy calculation
  const abs = abilities || [];
  const abilityCount = abs.length;
  let abilityBonus = 0;
  if (abilityCount > 0) {
    const avgPowerLevel = abs.reduce((acc, a) => acc + (a.power_level ?? 5), 0) / abilityCount;
    // Scale ability bonus up to 8 points based on count & potency
    abilityBonus = Math.min(8, (avgPowerLevel / 10) * (Math.min(abilityCount, 5) * 1.6));
  }

  // Raw score with balanced weights
  const rawScore = statAverage * 0.88 + statVarianceBonus + abilityBonus;
  const score = Math.round(Math.min(100, Math.max(10, rawScore)));

  // Tier classification
  let tier: PowerRatingResult['tier'];
  if (score >= 95) {
    tier = {
      rank: 'S+',
      titleArabic: 'مستوى كوني / إلهي',
      titleEnglish: 'Cosmic Entity',
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.6)',
      badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/30 border-amber-400',
    };
  } else if (score >= 88) {
    tier = {
      rank: 'S',
      titleArabic: 'أسطوري خارق',
      titleEnglish: 'Mythic Legend',
      color: '#E056FD',
      glowColor: 'rgba(224, 86, 253, 0.5)',
      badgeBg: 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/30 border-fuchsia-400',
    };
  } else if (score >= 80) {
    tier = {
      rank: 'A+',
      titleArabic: 'نخبة الأبطال',
      titleEnglish: 'Apex Vanguard',
      color: '#38BDF8',
      glowColor: 'rgba(56, 189, 248, 0.5)',
      badgeBg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/30 border-cyan-400',
    };
  } else if (score >= 70) {
    tier = {
      rank: 'A',
      titleArabic: 'بطل متمرس',
      titleEnglish: 'Master Hero',
      color: '#34D399',
      glowColor: 'rgba(52, 211, 153, 0.5)',
      badgeBg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/30 border-emerald-400',
    };
  } else if (score >= 55) {
    tier = {
      rank: 'B',
      titleArabic: 'محارب ماهر',
      titleEnglish: 'Skilled Warrior',
      color: '#FBBF24',
      glowColor: 'rgba(251, 191, 36, 0.4)',
      badgeBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/30 border-amber-500/50',
    };
  } else {
    tier = {
      rank: 'C',
      titleArabic: 'في طور الصعود',
      titleEnglish: 'Ascending Novice',
      color: '#9CA3AF',
      glowColor: 'rgba(156, 163, 175, 0.3)',
      badgeBg: 'bg-gradient-to-r from-gray-500/20 to-slate-500/30 border-gray-500/40',
    };
  }

  // Combat Archetype calculation
  let archetype: PowerRatingResult['archetype'];
  const spread = maxStat - minStat;

  if (spread <= 12 && statAverage >= 75) {
    archetype = {
      titleArabic: 'المتوازن الأسطوري الشامل',
      titleEnglish: 'Omni Paragon',
      descriptionArabic: 'يمتلك تناغماً مثالياً بين القوة البدنية والسرعة والحكمة والتكتيك.',
      icon: '👑',
    };
  } else if (mag >= 80 && mag >= str && mag >= spd) {
    archetype = {
      titleArabic: 'حكيم الطاقة والسحر',
      titleEnglish: 'Arcane Master',
      descriptionArabic: 'يتحكم في العناصر والقوى الخارقة مع تسخير الطاقات الغيبية ببراعة.',
      icon: '✨',
    };
  } else if (str >= 80 && str >= mag && str >= spd) {
    archetype = {
      titleArabic: 'العملاق الهائج المدمّر',
      titleEnglish: 'Colossus Titan',
      descriptionArabic: 'قوة جسدية خارقة قادرة على سحق أعتى العقبات في الخطوط الأمامية.',
      icon: '⚔️',
    };
  } else if (spd >= 80 && spd >= str) {
    archetype = {
      titleArabic: 'الشبح الخاطف السريع',
      titleEnglish: 'Phantom Speedster',
      descriptionArabic: 'سرعة رد فعل وحركة فائقة تتجاوز إدراك الخصوم وتمنحه تفوقاً حركياً.',
      icon: '⚡',
    };
  } else if (int >= 80 && int >= str) {
    archetype = {
      titleArabic: 'العقل المدبر والتكتيكي',
      titleEnglish: 'Grand Strategist',
      descriptionArabic: 'ذكاء حاد وقدرة فائقة على التخطيط واستغلال نقاط ضعف الخصوم.',
      icon: '🧠',
    };
  } else if (wil >= 80) {
    archetype = {
      titleArabic: 'الحارس الصامد المنيع',
      titleEnglish: 'Indomitable Sentinel',
      descriptionArabic: 'إرادة فولاذية وعزيمة حديدية تحميه من الانهيار وتلهم الحلفاء.',
      icon: '🛡️',
    };
  } else {
    archetype = {
      titleArabic: 'مقاتل متعدد القدرات',
      titleEnglish: 'Hybrid Combatant',
      descriptionArabic: 'يجمع بين عدة فنون قتالية وتكتيكات متكيفة حسب مجريات المعركة.',
      icon: '🔥',
    };
  }

  // Combat metrics breakdown (out of 100)
  const metrics = {
    offense: Math.round(Math.min(100, Math.max(10, str * 0.55 + spd * 0.2 + mag * 0.25))),
    defense: Math.round(Math.min(100, Math.max(10, wil * 0.5 + str * 0.3 + wis * 0.2))),
    agility: Math.round(Math.min(100, Math.max(10, spd * 0.7 + int * 0.3))),
    tactics: Math.round(Math.min(100, Math.max(10, mag * 0.45 + int * 0.35 + wis * 0.2))),
  };

  return {
    score,
    tier,
    archetype,
    metrics,
  };
}
