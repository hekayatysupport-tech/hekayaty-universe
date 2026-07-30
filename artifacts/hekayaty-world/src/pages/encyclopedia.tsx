import React, { useState } from 'react';
import { Search, Book, Bookmark, History } from 'lucide-react';

const CATEGORIES = [
  'Characters', 'Locations', 'Organizations', 'Artifacts', 'Creatures', 'Cosmic Entities', 'Technologies', 'Magic Systems'
];

export function Encyclopedia() {
  const [search, setSearch] = useState('');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <Book className="w-12 h-12 text-primary mx-auto mb-6" />
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-4 text-glow">The Great Archive</h1>
        <p className="text-xl text-muted-foreground font-light">
          A comprehensive database of lore. Compiled by the scholars of the Sunken Citadel.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative mb-20">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search the archives..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border text-foreground px-14 py-4 text-lg focus:outline-none focus:border-primary transition-colors shadow-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map(cat => (
          <div key={cat} className="p-8 bg-card border border-border hover:border-primary cursor-pointer transition-all group flex flex-col items-center justify-center text-center h-48">
             <h3 className="font-serif text-2xl font-bold group-hover:text-primary transition-colors">{cat}</h3>
             <span className="text-sm text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
