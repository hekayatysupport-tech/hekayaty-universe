export interface Character {
  id: string;
  name: string;
  arabicName: string;
  alias: string;
  alignment: 'Hero' | 'Villain' | 'Antihero' | 'Neutral';
  powerCategory: string;
  worldId: string;
  organization: string;
  status: 'Active' | 'Deceased' | 'Unknown' | 'Imprisoned';
  shortBio: string;
  fullBio: string;
  abilities: string[];
  stats: {
    strength: number;
    magic: number;
    agility: number;
    intelligence: number;
    durability: number;
  };
  imageKey: string;
  firstAppearance: string;
}

export const MOCK_CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: 'Al-Saqr',
    arabicName: 'الصقر',
    alias: 'The Falcon',
    alignment: 'Hero',
    powerCategory: 'Enhanced Combat',
    worldId: 'w1',
    organization: 'The Sky Vanguard',
    status: 'Active',
    shortBio: 'A legendary warrior possessing the ancient Armor of the Sun, defending the sky kingdoms from terrestrial threats.',
    fullBio: 'Born in the high peaks of the Aethel Mountains, Al-Saqr was chosen by the ancient spirits to wield the Solar Plate, an armor forged in the heart of a dying star. He represents the ultimate justice and strikes with blinding speed.',
    abilities: ['Flight', 'Solar Energy Projection', 'Master Hand-to-hand Combat', 'Enhanced Durability'],
    stats: { strength: 75, magic: 40, agility: 95, intelligence: 80, durability: 70 },
    imageKey: 'char-saqr.jpg',
    firstAppearance: 'com1'
  },
  {
    id: 'c2',
    name: 'Bint al-Nahr',
    arabicName: 'بنت النهر',
    alias: 'Daughter of the River',
    alignment: 'Hero',
    powerCategory: 'Elemental Magic',
    worldId: 'w2',
    organization: 'Council of Tides',
    status: 'Active',
    shortBio: 'A powerful water mage who can commune with the ancient leviathans of the deep.',
    fullBio: 'Raised in the Sunken Citadel, Bint al-Nahr discovered her ability to shape water at a young age. As the firstborn of the royal lineage in over a century with true elemental affinity, she bears the weight of her entire civilization.',
    abilities: ['Hydrokinesis', 'Water Breathing', 'Healing', 'Ice Manipulation'],
    stats: { strength: 40, magic: 90, agility: 75, intelligence: 85, durability: 50 },
    imageKey: 'char-nahr.jpg',
    firstAppearance: 'com2'
  },
  {
    id: 'c3',
    name: 'Al-Dhayef',
    arabicName: 'الضيف',
    alias: 'The Shadow / The Guest',
    alignment: 'Antihero',
    powerCategory: 'Shadow Magic',
    worldId: 'w4',
    organization: 'The Unseen Hand',
    status: 'Active',
    shortBio: 'An assassin wrapped in an obsidian shadow cloak, bound by a strict, lethal code of honor.',
    fullBio: 'Known only as "The Guest" because he arrives uninvited and leaves no trace. Al-Dhayef was trained in the Iron Vale, learning to manipulate the darkness itself as a weapon and a shield. He fights for a twisted sense of balance.',
    abilities: ['Shadow Step', 'Invisibility', 'Void Blade manifestation', 'Aura Suppression'],
    stats: { strength: 60, magic: 75, agility: 100, intelligence: 90, durability: 45 },
    imageKey: 'char-dhayef.jpg',
    firstAppearance: 'com1'
  },
  {
    id: 'c4',
    name: 'Umm al-Nar',
    arabicName: 'أم النار',
    alias: 'Mother of Fire',
    alignment: 'Villain',
    powerCategory: 'Elemental Magic',
    worldId: 'w1',
    organization: 'The Ashen Order',
    status: 'Active',
    shortBio: 'A terrifying elementalist seeking to cleanse the world in primordial flame.',
    fullBio: 'Once a respected elder of the desert tribes, Umm al-Nar discovered a forbidden text that bound her soul to an ancient efreet. She now believes that the only way to save the world from corruption is to burn it entirely and start anew.',
    abilities: ['Pyrokinesis', 'Magma Control', 'Flight', 'Heat Aura'],
    stats: { strength: 50, magic: 95, agility: 60, intelligence: 80, durability: 85 },
    imageKey: 'char-nar.jpg',
    firstAppearance: 'com3'
  },
  {
    id: 'c5',
    name: 'Sirius',
    arabicName: 'سيريوس',
    alias: 'The Star Knight',
    alignment: 'Hero',
    powerCategory: 'Cosmic Power',
    worldId: 'w5',
    organization: 'The Astral Guard',
    status: 'Active',
    shortBio: 'A cosmic crusader wielding a blade forged from the heart of a dying star.',
    fullBio: 'Sirius fell from the sky during the Great Eclipse. He remembers nothing of his past, only his duty to protect the universe from the creeping void. His armor shines with the light of a thousand galaxies.',
    abilities: ['Starlight Blasts', 'Vacuum Survival', 'Super Strength', 'Light-speed Travel'],
    stats: { strength: 90, magic: 85, agility: 70, intelligence: 60, durability: 95 },
    imageKey: 'char-sirius.jpg',
    firstAppearance: 'com3'
  },
  {
    id: 'c6',
    name: 'Al-Sarab',
    arabicName: 'السراب',
    alias: 'The Desert Wraith',
    alignment: 'Antihero',
    powerCategory: 'Illusion / Time',
    worldId: 'w1',
    organization: 'None',
    status: 'Unknown',
    shortBio: 'A mysterious entity wandering the Eternal Desert, capable of trapping foes in endless mirages.',
    fullBio: 'Some say he is a cursed prince, others say he is the desert itself given form. The Desert Wraith controls the sands and the flow of time within his domain. He helps lost travelers or buries conquerors, depending on his unknowable whims.',
    abilities: ['Illusion Casting', 'Sand Manipulation', 'Time Dilation', 'Intangibility'],
    stats: { strength: 30, magic: 100, agility: 80, intelligence: 95, durability: 20 },
    imageKey: 'char-wraith.jpg',
    firstAppearance: 'com4'
  }
];
