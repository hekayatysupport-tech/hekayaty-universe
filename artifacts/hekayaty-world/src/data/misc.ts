export interface NewsArticle {
  id: string;
  title: string;
  category: 'Announcements' | 'Releases' | 'Events' | 'Trailers';
  date: string;
  excerpt: string;
  content: string;
  imageKey: string;
}

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Hekayaty Universe Phase 2 Announced at Comic Con',
    category: 'Announcements',
    date: '2023-10-15',
    excerpt: 'The creators behind the largest Arabic superhero franchise have unveiled their roadmap for the next three years of content.',
    content: 'Full content goes here...',
    imageKey: 'hero-bg.jpg'
  },
  {
    id: 'n2',
    title: 'Vanguard Legends #12 Shatters Sales Records',
    category: 'Releases',
    date: '2023-10-10',
    excerpt: 'The climax of the "Shadow War" arc has proven to be the most popular issue in the franchise\'s history.',
    content: 'Full content goes here...',
    imageKey: 'comic-1.jpg'
  },
  {
    id: 'n3',
    title: 'New TCG Expansion: Sands of Time',
    category: 'Releases',
    date: '2023-10-05',
    excerpt: 'Over 150 new cards featuring characters and spells from the Eternal Desert are coming to the digital client next month.',
    content: 'Full content goes here...',
    imageKey: 'world-desert.jpg'
  }
];

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  category: 'War' | 'Discovery' | 'Politics' | 'Cosmic';
}

export const MOCK_TIMELINE: TimelineEvent[] = [
  { id: 't1', year: 'Before Known Time', title: 'The Forging of the Solar Plate', description: 'Cosmic beings shape armor from a dying star.', category: 'Cosmic' },
  { id: 't2', year: 'Year 0', title: 'The Great Sundering', description: 'The planet shatters, forming the Sky Kingdoms and sinking the Citadel.', category: 'Cosmic' },
  { id: 't3', year: 'Year 450', title: 'The First Shadow War', description: 'Forces of the Iron Vale attempt to conquer the surface.', category: 'War' },
  { id: 't4', year: 'Year 1200', title: 'Discovery of the Veil Between', description: 'Astromancers map the cosmic nexus.', category: 'Discovery' },
  { id: 't5', year: 'Year 1540', title: 'Rise of The Vanguard', description: 'Al-Saqr and allies form the first formal defense pact.', category: 'Politics' },
];
