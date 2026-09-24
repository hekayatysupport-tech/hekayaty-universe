export interface GenreAtmosphere {
  id: string;
  nameArabic: string;
  accent: string;
  accentLight: string;
  glowColor: string;
  badgeBg: string;
  badgeBorder: string;
  progressGradient: string;
  headerBorder: string;
  quoteBorder: string;
  dividerSymbol: string;
}

const ATMOSPHERES: Record<string, GenreAtmosphere> = {
  fantasy: {
    id: "fantasy",
    nameArabic: "فانتازيا",
    accent: "#D4AF37",
    accentLight: "#FFF7D6",
    glowColor: "rgba(212, 175, 55, 0.08)",
    badgeBg: "rgba(212, 175, 55, 0.12)",
    badgeBorder: "rgba(212, 175, 55, 0.35)",
    progressGradient: "linear-gradient(to left, #D4AF37, #F5C842)",
    headerBorder: "rgba(212, 175, 55, 0.25)",
    quoteBorder: "#D4AF37",
    dividerSymbol: "❖ ❖ ❖",
  },
  horror: {
    id: "horror",
    nameArabic: "رعب",
    accent: "#E53E3E",
    accentLight: "#FED7D7",
    glowColor: "rgba(229, 62, 62, 0.06)",
    badgeBg: "rgba(229, 62, 62, 0.12)",
    badgeBorder: "rgba(229, 62, 62, 0.35)",
    progressGradient: "linear-gradient(to left, #E53E3E, #9B2C2C)",
    headerBorder: "rgba(229, 62, 62, 0.25)",
    quoteBorder: "#E53E3E",
    dividerSymbol: "✦ ✦ ✦",
  },
  science_fiction: {
    id: "science_fiction",
    nameArabic: "خيال علمي",
    accent: "#00B4D8",
    accentLight: "#E0F7FA",
    glowColor: "rgba(0, 180, 216, 0.07)",
    badgeBg: "rgba(0, 180, 216, 0.12)",
    badgeBorder: "rgba(0, 180, 216, 0.35)",
    progressGradient: "linear-gradient(to left, #00B4D8, #90E0EF)",
    headerBorder: "rgba(0, 180, 216, 0.25)",
    quoteBorder: "#00B4D8",
    dividerSymbol: "◈ ◈ ◈",
  },
  romance: {
    id: "romance",
    nameArabic: "رومانسية",
    accent: "#ED64A6",
    accentLight: "#FED7E2",
    glowColor: "rgba(237, 100, 166, 0.07)",
    badgeBg: "rgba(237, 100, 166, 0.12)",
    badgeBorder: "rgba(237, 100, 166, 0.35)",
    progressGradient: "linear-gradient(to left, #ED64A6, #FBB6CE)",
    headerBorder: "rgba(237, 100, 166, 0.25)",
    quoteBorder: "#ED64A6",
    dividerSymbol: "♥ ♥ ♥",
  },
  historical: {
    id: "historical",
    nameArabic: "تاريخي",
    accent: "#C59B27",
    accentLight: "#FDF6E3",
    glowColor: "rgba(197, 155, 39, 0.07)",
    badgeBg: "rgba(197, 155, 39, 0.12)",
    badgeBorder: "rgba(197, 155, 39, 0.35)",
    progressGradient: "linear-gradient(to left, #C59B27, #8C6A15)",
    headerBorder: "rgba(197, 155, 39, 0.25)",
    quoteBorder: "#C59B27",
    dividerSymbol: "📜 📜 📜",
  },
  mystery: {
    id: "mystery",
    nameArabic: "غموض",
    accent: "#805AD5",
    accentLight: "#E9D8FD",
    glowColor: "rgba(128, 90, 213, 0.07)",
    badgeBg: "rgba(128, 90, 213, 0.12)",
    badgeBorder: "rgba(128, 90, 213, 0.35)",
    progressGradient: "linear-gradient(to left, #805AD5, #B794F4)",
    headerBorder: "rgba(128, 90, 213, 0.25)",
    quoteBorder: "#805AD5",
    dividerSymbol: "🔍 🔍 🔍",
  },
  thriller: {
    id: "thriller",
    nameArabic: "تشويق وإثارة",
    accent: "#DD6B20",
    accentLight: "#FEEBC8",
    glowColor: "rgba(221, 107, 32, 0.07)",
    badgeBg: "rgba(221, 107, 32, 0.12)",
    badgeBorder: "rgba(221, 107, 32, 0.35)",
    progressGradient: "linear-gradient(to left, #DD6B20, #FBD38D)",
    headerBorder: "rgba(221, 107, 32, 0.25)",
    quoteBorder: "#DD6B20",
    dividerSymbol: "⚡ ⚡ ⚡",
  },
  comedy: {
    id: "comedy",
    nameArabic: "كوميديا",
    accent: "#38A169",
    accentLight: "#C6F6D5",
    glowColor: "rgba(56, 161, 105, 0.07)",
    badgeBg: "rgba(56, 161, 105, 0.12)",
    badgeBorder: "rgba(56, 161, 105, 0.35)",
    progressGradient: "linear-gradient(to left, #38A169, #9AE6B4)",
    headerBorder: "rgba(56, 161, 105, 0.25)",
    quoteBorder: "#38A169",
    dividerSymbol: "★ ★ ★",
  },
  action: {
    id: "action",
    nameArabic: "أكشن / حركة",
    accent: "#F56565",
    accentLight: "#FEB2B2",
    glowColor: "rgba(245, 101, 101, 0.07)",
    badgeBg: "rgba(245, 101, 101, 0.12)",
    badgeBorder: "rgba(245, 101, 101, 0.35)",
    progressGradient: "linear-gradient(to left, #F56565, #C53030)",
    headerBorder: "rgba(245, 101, 101, 0.25)",
    quoteBorder: "#F56565",
    dividerSymbol: "🗡 🗡 🗡",
  },
  adventure: {
    id: "adventure",
    nameArabic: "مغامرات",
    accent: "#D69E2E",
    accentLight: "#FEFCBF",
    glowColor: "rgba(214, 158, 46, 0.07)",
    badgeBg: "rgba(214, 158, 46, 0.12)",
    badgeBorder: "rgba(214, 158, 46, 0.35)",
    progressGradient: "linear-gradient(to left, #D69E2E, #FAF089)",
    headerBorder: "rgba(214, 158, 46, 0.25)",
    quoteBorder: "#D69E2E",
    dividerSymbol: "🧭 🧭 🧭",
  },
  drama: {
    id: "drama",
    nameArabic: "دراما",
    accent: "#319795",
    accentLight: "#E6FFFA",
    glowColor: "rgba(49, 151, 149, 0.07)",
    badgeBg: "rgba(49, 151, 149, 0.12)",
    badgeBorder: "rgba(49, 151, 149, 0.35)",
    progressGradient: "linear-gradient(to left, #319795, #81E6D9)",
    headerBorder: "rgba(49, 151, 149, 0.25)",
    quoteBorder: "#319795",
    dividerSymbol: "🎭 🎭 🎭",
  },
  supernatural: {
    id: "supernatural",
    nameArabic: "خوارق للعادة",
    accent: "#9F7AEA",
    accentLight: "#E9D8FD",
    glowColor: "rgba(159, 122, 234, 0.07)",
    badgeBg: "rgba(159, 122, 234, 0.12)",
    badgeBorder: "rgba(159, 122, 234, 0.35)",
    progressGradient: "linear-gradient(to left, #9F7AEA, #D6BCFA)",
    headerBorder: "rgba(159, 122, 234, 0.25)",
    quoteBorder: "#9F7AEA",
    dividerSymbol: "✨ ✨ ✨",
  },
};

const DEFAULT_ATMOSPHERE: GenreAtmosphere = {
  id: "default",
  nameArabic: "حكاياتي",
  accent: "#D4AF37",
  accentLight: "#FFF7D6",
  glowColor: "rgba(212, 175, 55, 0.06)",
  badgeBg: "rgba(212, 175, 55, 0.12)",
  badgeBorder: "rgba(212, 175, 55, 0.35)",
  progressGradient: "linear-gradient(to left, #D4AF37, #F5C842)",
  headerBorder: "rgba(212, 175, 55, 0.25)",
  quoteBorder: "#D4AF37",
  dividerSymbol: "❖ ❖ ❖",
};

export function getGenreAtmosphere(genreName?: string): GenreAtmosphere {
  if (!genreName) return DEFAULT_ATMOSPHERE;
  const normalized = genreName.toLowerCase().trim().replace(/[\s-]+/g, "_");

  if (ATMOSPHERES[normalized]) return ATMOSPHERES[normalized];

  if (normalized.includes("fantasy") || normalized.includes("فانتازيا") || normalized.includes("سحر")) return ATMOSPHERES.fantasy;
  if (normalized.includes("horror") || normalized.includes("رعب")) return ATMOSPHERES.horror;
  if (normalized.includes("sci") || normalized.includes("خيال_علمي")) return ATMOSPHERES.science_fiction;
  if (normalized.includes("romance") || normalized.includes("رومانس")) return ATMOSPHERES.romance;
  if (normalized.includes("history") || normalized.includes("تاريخ")) return ATMOSPHERES.historical;
  if (normalized.includes("mystery") || normalized.includes("غموض")) return ATMOSPHERES.mystery;
  if (normalized.includes("thriller") || normalized.includes("إثارة") || normalized.includes("تشويق")) return ATMOSPHERES.thriller;
  if (normalized.includes("comedy") || normalized.includes("كوميد")) return ATMOSPHERES.comedy;
  if (normalized.includes("action") || normalized.includes("أكشن") || normalized.includes("حركة")) return ATMOSPHERES.action;
  if (normalized.includes("adventure") || normalized.includes("مغامر")) return ATMOSPHERES.adventure;
  if (normalized.includes("drama") || normalized.includes("دراما")) return ATMOSPHERES.drama;
  if (normalized.includes("supernatural") || normalized.includes("خوارق")) return ATMOSPHERES.supernatural;

  return DEFAULT_ATMOSPHERE;
}
