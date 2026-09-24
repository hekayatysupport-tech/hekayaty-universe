export interface Character {
  id: string;
  name: string;
  arabicName: string;
  alias: string;
  title: string;
  quote: string;
  alignment: 'Hero' | 'Villain' | 'Antihero' | 'Neutral';
  powerCategory: string;
  worldId: string;
  organization: string;
  status: 'Active' | 'Deceased' | 'Unknown' | 'Imprisoned';
  shortBio: string;
  fullBio: string;
  aboutText: string;
  abilities: string[];
  stats: {
    strength: number; // القوة
    speed: number;    // السرعة
    intelligence: number; // الذكاء
    wisdom: number;   // الحكمة
    willpower: number; // الإرادة
    magic: number;    // السحر
  };
  imageKey: string;
  firstAppearance: string;
  relationships: {
    id: string;
    name: string;
    relation: string;
    imageKey: string;
  }[];
  artifacts: {
    id: string;
    name: string;
    type: string;
    imageKey: string;
  }[];
  timeline: {
    year: string;
    title: string;
    subtitle: string;
  }[];
  appearances: {
    id: string;
    title: string;
    subtitle: string;
    imageKey: string;
  }[];
  gallery: string[];
  encyclopediaRefs: {
    id: string;
    title: string;
    subtitle: string;
  }[];
  worldRefs: {
    id: string;
    title: string;
    subtitle: string;
    imageKey: string;
  }[];
}

export const MOCK_CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: 'Tarek',
    arabicName: 'طارق',
    alias: 'Al-Saqr',
    title: 'وارث النور\nHEIR OF LIGHT',
    quote: 'النور لا يُمنح... بل يُكتسب',
    alignment: 'Hero',
    powerCategory: 'Enhanced Combat',
    worldId: 'w1',
    organization: 'The Sky Vanguard',
    status: 'Active',
    shortBio: 'A legendary warrior possessing the ancient Armor of the Sun, defending the sky kingdoms from terrestrial threats.',
    fullBio: 'Born in the high peaks of the Aethel Mountains, Al-Saqr was chosen by the ancient spirits to wield the Solar Plate, an armor forged in the heart of a dying star. He represents the ultimate justice and strikes with blinding speed.',
    aboutText: 'طارق، شاب نشأ في قرية أطير النائية يحمل قلباً نقياً وروحاً لا تعرف الخوف. منذ طفولته وهو يرى نوراً خفياً في ليلة... حاملاً عن عالم مجهول... سر ينتظره.\n\nلم يكن يعلم أن هذا الحلم هو جزء من قدره. ولم يكن يدري أن النور الذي يبحث عنه... يسكنه هو.',
    abilities: ['Flight', 'Solar Energy Projection', 'Master Hand-to-hand Combat', 'Enhanced Durability'],
    stats: { strength: 95, speed: 88, intelligence: 92, wisdom: 97, willpower: 100, magic: 93 },
    imageKey: 'background photo.png',
    firstAppearance: 'com1',
    relationships: [
      { id: 'r1', name: 'الشيخ ليث', relation: 'المرشد', imageKey: 'char-sirius.jpg' },
      { id: 'r2', name: 'زياد', relation: 'صديق مقرب', imageKey: 'char-dhayef.jpg' },
      { id: 'r3', name: 'نوران', relation: 'حليفة', imageKey: 'char-nahr.jpg' },
      { id: 'r4', name: 'زهراء', relation: 'الجدة', imageKey: 'char-nar.jpg' }
    ],
    artifacts: [
      { id: 'a1', name: 'سيف النور', type: 'أسطورة', imageKey: 'comic-1.jpg' },
      { id: 'a2', name: 'خاتم الحكمة', type: 'خاتم', imageKey: 'char-nahr.jpg' },
      { id: 'a3', name: 'عباءة الظلال', type: 'درع', imageKey: 'char-dhayef.jpg' },
      { id: 'a4', name: 'قلب الشجاعة', type: 'أثر', imageKey: 'char-nar.jpg' }
    ],
    timeline: [
      { year: '1001', title: 'بداية الحلم', subtitle: 'حلم غريب يراود طارق في أطير.' },
      { year: '1005', title: 'اكتشاف القدر', subtitle: 'علامات تظهر عن ماضيه وأصله.' },
      { year: '1008', title: 'أول اختبار', subtitle: 'مواجهة طارق لأول عدو حقيقي.' },
      { year: '1010', title: 'وارث النور', subtitle: 'قبول طارق مصيره ووراثة النور.' }
    ],
    appearances: [
      { id: 'ap1', title: 'بداية الحلم', subtitle: 'الجزء الأول', imageKey: 'comic-1.jpg' },
      { id: 'ap2', title: 'اختبار الظلال', subtitle: 'الجزء الثاني', imageKey: 'comic-1.jpg' },
      { id: 'ap3', title: 'قلب الصحراء', subtitle: 'الجزء الثالث', imageKey: 'comic-1.jpg' },
      { id: 'ap4', title: 'وارث النور', subtitle: 'الجزء الرابع', imageKey: 'comic-1.jpg' }
    ],
    gallery: [
      'background photo.png',
      'comic-1.jpg',
      'hero-bg.jpg'
    ],
    encyclopediaRefs: [
      { id: 'er1', title: 'تاريخ النور', subtitle: 'المجلد الأول - صفحة 45' },
      { id: 'er2', title: 'الأساطير القديمة', subtitle: 'المجلد الثاني - صفحة 112' },
      { id: 'er3', title: 'سجل الحراس', subtitle: 'المجلد الثالث - صفحة 78' }
    ],
    worldRefs: [
      { id: 'wr1', title: 'قرية أطير', subtitle: 'الموطن الأصلي', imageKey: 'hero-bg.jpg' },
      { id: 'wr2', title: 'صحراء الأسرار', subtitle: 'المنطقة المخفية', imageKey: 'world-desert.jpg' },
      { id: 'wr3', title: 'بوابة النور', subtitle: 'المعلم المقدس', imageKey: 'background photo.png' },
      { id: 'wr4', title: 'جبل القدر', subtitle: 'المناطق الأسطورية', imageKey: 'world-desert.jpg' }
    ]
  },
  {
    id: 'c2',
    name: 'Bint al-Nahr',
    arabicName: 'بنت النهر',
    alias: 'Daughter of the River',
    title: 'سيدة المد',
    quote: 'الماء لا ينسى أبداً',
    alignment: 'Hero',
    powerCategory: 'Elemental Magic',
    worldId: 'w2',
    organization: 'Council of Tides',
    status: 'Active',
    shortBio: 'A powerful water mage who can commune with the ancient leviathans of the deep.',
    fullBio: 'Raised in the Sunken Citadel...',
    aboutText: 'بنت النهر هي الأمل الأخير للمدينة الغارقة.',
    abilities: ['Hydrokinesis', 'Water Breathing'],
    stats: { strength: 40, speed: 75, intelligence: 85, wisdom: 90, willpower: 80, magic: 95 },
    imageKey: 'char-nahr.jpg',
    firstAppearance: 'com2',
    relationships: [],
    artifacts: [],
    timeline: [],
    appearances: [],
    gallery: [],
    encyclopediaRefs: [],
    worldRefs: []
  },
  {
    id: 'c3',
    name: 'Al-Dhayef',
    arabicName: 'الضيف',
    alias: 'The Shadow / The Guest',
    title: 'ظل الليل',
    quote: 'الظلام يرى ما لا تراه',
    alignment: 'Antihero',
    powerCategory: 'Shadow Magic',
    worldId: 'w4',
    organization: 'The Unseen Hand',
    status: 'Active',
    shortBio: 'An assassin wrapped in an obsidian shadow cloak, bound by a strict, lethal code of honor.',
    fullBio: 'Known only as "The Guest"...',
    aboutText: 'الضيف، شخصية غامضة لا تُعرف ملامحها.',
    abilities: ['Shadow Step', 'Invisibility'],
    stats: { strength: 60, speed: 100, intelligence: 90, wisdom: 70, willpower: 85, magic: 75 },
    imageKey: 'char-dhayef.jpg',
    firstAppearance: 'com1',
    relationships: [],
    artifacts: [],
    timeline: [],
    appearances: [],
    gallery: [],
    encyclopediaRefs: [],
    worldRefs: []
  }
];
