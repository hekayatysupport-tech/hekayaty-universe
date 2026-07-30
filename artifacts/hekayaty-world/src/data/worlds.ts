export interface World {
  id: string;
  name: string;
  arabicName: string;
  type: string;
  description: string;
  majorFactions: string[];
  bannerImageKey: string;
  stats: {
    population: string;
    magicLevel: 'Low' | 'Medium' | 'High' | 'Cataclysmic';
    techLevel: 'Primitive' | 'Medieval' | 'Steampunk' | 'Advanced' | 'Cosmic';
  }
}

export const MOCK_WORLDS: World[] = [
  {
    id: 'w1',
    name: 'The Eternal Desert',
    arabicName: 'الصحراء الأبدية',
    type: 'Terrestrial Realm',
    description: 'A vast, unforgiving landscape of golden dunes and ancient ruins. Time flows strangely here, and mirages often reveal echoes of the past.',
    majorFactions: ['The Ashen Order', 'Nomads of the Wind'],
    bannerImageKey: 'world-desert.jpg',
    stats: { population: '5 Million', magicLevel: 'High', techLevel: 'Medieval' }
  },
  {
    id: 'w2',
    name: 'The Sunken Citadel',
    arabicName: 'القلعة الغارقة',
    type: 'Aquatic Realm',
    description: 'Deep beneath the crushing waves lies a city of bioluminescent corals and magical domes. It houses the oldest libraries in the universe.',
    majorFactions: ['Council of Tides', 'Abyssal Cults'],
    bannerImageKey: 'world-citadel.jpg',
    stats: { population: '12 Million', magicLevel: 'High', techLevel: 'Advanced' }
  },
  {
    id: 'w3',
    name: 'The Sky Kingdoms',
    arabicName: 'ممالك السماء',
    type: 'Floating Archipelago',
    description: 'Massive landmasses suspended above the clouds by ancient gravitation crystals. Connected by bridges of solid light.',
    majorFactions: ['The Sky Vanguard', 'The Cloud Barons'],
    bannerImageKey: 'world-sky.jpg',
    stats: { population: '8 Million', magicLevel: 'Medium', techLevel: 'Steampunk' }
  },
  {
    id: 'w4',
    name: 'The Iron Vale',
    arabicName: 'وادي الحديد',
    type: 'Volcanic Fortress',
    description: 'A grim, soot-choked valley where dark magic and heavy industry merge. The forge-fires never die in the Iron Vale.',
    majorFactions: ['The Unseen Hand', 'Ironcrafters Guild'],
    bannerImageKey: 'world-iron.jpg',
    stats: { population: '20 Million', magicLevel: 'Low', techLevel: 'Advanced' }
  },
  {
    id: 'w5',
    name: 'The Veil Between',
    arabicName: 'الحجاب الفاصل',
    type: 'Cosmic Nexus',
    description: 'A metaphysical realm connecting different planets and dimensions. It looks like an endless sea of stars woven together by threads of energy.',
    majorFactions: ['The Astral Guard', 'Void Walkers'],
    bannerImageKey: 'hero-bg.jpg',
    stats: { population: 'Unknown', magicLevel: 'Cataclysmic', techLevel: 'Cosmic' }
  }
];
