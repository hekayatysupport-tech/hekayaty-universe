import React, { useState } from 'react';
import { MOCK_COMICS } from '@/data/comics';
import { getImageUrl } from '@/assets';
import { Link } from 'wouter';
import { Filter, Search, LayoutGrid, List } from 'lucide-react';

export function Comics() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = MOCK_COMICS.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.series.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">The Library</h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-light">
          Read the official comic series. Explore epic crossovers, standalone graphic novels, and ongoing runs.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search titles, series..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground px-10 py-3 focus:outline-none focus:border-primary transition-colors font-serif"
          />
        </div>
        
        <div className="flex items-center gap-4 border border-border bg-card p-1">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-2 transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filtered.map(comic => (
            <Link key={comic.id} href={`/comics/${comic.id}`}>
              <div className="group cursor-pointer">
                <div className="relative aspect-[2/3] mb-4 overflow-hidden border border-border group-hover:border-primary transition-colors shadow-lg">
                  <img 
                    src={getImageUrl(comic.coverImageKey)} 
                    alt={comic.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground font-bold px-3 py-1 text-xs">
                    ${comic.price}
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">{comic.title}</h3>
                <p className="text-sm text-muted-foreground">{comic.series} #{comic.issueNumber}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map(comic => (
            <Link key={comic.id} href={`/comics/${comic.id}`}>
              <div className="flex flex-col sm:flex-row gap-6 p-4 border border-border bg-card hover:border-primary transition-colors cursor-pointer group">
                <div className="w-full sm:w-40 aspect-[2/3] shrink-0 border border-border overflow-hidden">
                  <img src={getImageUrl(comic.coverImageKey)} alt={comic.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-xs uppercase font-bold text-primary mb-2">{comic.series} • Issue #{comic.issueNumber}</div>
                  <h3 className="text-3xl font-serif font-bold mb-2 group-hover:text-primary transition-colors">{comic.title}</h3>
                  <p className="text-xl font-serif text-muted-foreground mb-4">{comic.arabicTitle}</p>
                  <p className="text-foreground/80 line-clamp-3 mb-6 font-light">{comic.synopsis}</p>
                  <div className="text-sm text-muted-foreground mt-auto">
                    By {comic.writer} (Writer) • {comic.artist} (Artist)
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
