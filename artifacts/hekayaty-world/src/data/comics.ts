export interface Comic {
  id: string;
  title: string;
  arabicTitle: string;
  issueNumber: number;
  series: string;
  writer: string;
  artist: string;
  releaseDate: string;
  synopsis: string;
  worldIds: string[];
  characterIds: string[];
  coverImageKey: string;
  price: number;
}

export const MOCK_COMICS: Comic[] = [
  {
    id: 'com1',
    title: 'Baghdad\'s Gate',
    arabicTitle: 'بوابة بغداد',
    issueNumber: 1,
    series: 'Vanguard Legends',
    writer: 'Tariq Al-Nasser',
    artist: 'Laila Mahmoud',
    releaseDate: '2023-01-15',
    synopsis: 'When the shadows creep out of the Iron Vale, Al-Saqr must don the Solar Plate for the first time. The battle for the Sky Kingdoms begins here.',
    worldIds: ['w3', 'w4'],
    characterIds: ['c1', 'c3'],
    coverImageKey: 'comic-1.jpg',
    price: 3.99
  },
  {
    id: 'com2',
    title: 'Guardian of the Sands',
    arabicTitle: 'حارس الرمال',
    issueNumber: 1,
    series: 'Deep Currents',
    writer: 'Omar Farooq',
    artist: 'Sarah Al-Amin',
    releaseDate: '2023-03-20',
    synopsis: 'Bint al-Nahr uncovers a conspiracy within the Sunken Citadel. An ancient evil stirs in the deep trenches, and she is the only one who can hear its whispers.',
    worldIds: ['w2'],
    characterIds: ['c2'],
    coverImageKey: 'comic-2.jpg',
    price: 3.99
  },
  {
    id: 'com3',
    title: 'Shadow Realms',
    arabicTitle: 'ممالك الظلال',
    issueNumber: 4,
    series: 'Cosmic Clash',
    writer: 'Zaid Hassan',
    artist: 'Nour Al-Din',
    releaseDate: '2023-05-10',
    synopsis: 'Umm al-Nar brings her fiery crusade to the stars. Sirius must intercept her before she ignites the orbital rings of the Veil Between.',
    worldIds: ['w5', 'w1'],
    characterIds: ['c4', 'c5'],
    coverImageKey: 'comic-3.jpg',
    price: 4.99
  },
  {
    id: 'com4',
    title: 'Legend of the Dove',
    arabicTitle: 'أسطورة اليمامة',
    issueNumber: 1,
    series: 'Wandering Sands',
    writer: 'Yousef Karim',
    artist: 'Farah B.',
    releaseDate: '2023-08-05',
    synopsis: 'A squad of mercenaries enters the Eternal Desert searching for an ancient artifact. They meet The Desert Wraith, and their perception of reality shatters.',
    worldIds: ['w1'],
    characterIds: ['c6', 'c1'],
    coverImageKey: 'comic-1.jpg',
    price: 3.99
  }
];
