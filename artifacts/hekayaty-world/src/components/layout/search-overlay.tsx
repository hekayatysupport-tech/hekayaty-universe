import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, BookOpen, User, Globe, Sparkles, Book, Newspaper, Crown } from 'lucide-react';
import { useAppStore } from '@/store';
import { useLocation } from 'wouter';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const handleClose = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const navigate = (path: string) => {
    setLocation(path);
    handleClose();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'original':
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded"><Crown className="w-3 h-3" /> Original</span>;
      case 'character':
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded"><User className="w-3 h-3" /> Character</span>;
      case 'world':
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded"><Globe className="w-3 h-3" /> World</span>;
      case 'comic':
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded"><BookOpen className="w-3 h-3" /> Comic</span>;
      case 'story':
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded"><Book className="w-3 h-3" /> Story</span>;
      case 'encyclopedia':
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded"><Sparkles className="w-3 h-3" /> Lore</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">{type}</span>;
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
        >
          <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-12 flex-1 flex flex-col safe-pt safe-pb">
            <div className="flex justify-end mb-2 sm:mb-4">
              <button
                onClick={handleClose}
                className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary text-foreground transition-colors flex items-center justify-center"
                aria-label="Close search"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search characters, worlds, stories..."
                className="w-full bg-transparent border-b-2 border-border focus:border-primary text-xl sm:text-3xl md:text-5xl font-serif text-foreground outline-none py-4 sm:py-6 pl-14 sm:pl-20 placeholder:text-muted-foreground/50 transition-colors"
                autoFocus
              />
            </div>

            <div className="mt-8 flex-1 overflow-y-auto pr-2">
              {!query ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">Trending Searches</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {['The Crossers', 'المعبرون', 'Tarek', 'طارق', 'Darkness World', 'Ziyad'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQuery(t)}
                          className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-xs font-semibold bg-secondary/20"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">Explore Universe</h3>
                    <div className="flex flex-col gap-3">
                      <button onClick={() => navigate('/originals')} className="flex items-center gap-4 text-lg font-serif hover:text-primary group text-left">
                        <Crown className="w-5 h-5 text-primary" /> Hekayaty Originals <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button onClick={() => navigate('/characters')} className="flex items-center gap-4 text-lg font-serif hover:text-primary group text-left">
                        <User className="w-5 h-5 opacity-50 group-hover:opacity-100" /> Characters <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button onClick={() => navigate('/worlds')} className="flex items-center gap-4 text-lg font-serif hover:text-primary group text-left">
                        <Globe className="w-5 h-5 opacity-50 group-hover:opacity-100" /> Worlds <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button onClick={() => navigate('/encyclopedia')} className="flex items-center gap-4 text-lg font-serif hover:text-primary group text-left">
                        <BookOpen className="w-5 h-5 opacity-50 group-hover:opacity-100" /> Encyclopedia <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  {loading && (
                    <div className="text-center py-8 text-xs text-muted-foreground">Searching database...</div>
                  )}

                  {!loading && results.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.map((res) => (
                        <div
                          key={`${res.type}-${res.id}`}
                          onClick={() => navigate(res.url)}
                          className="p-4 bg-card/60 border border-border rounded-xl hover:border-primary cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getTypeBadge(res.type)}
                              <h4 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors text-base">
                                {res.title}
                              </h4>
                            </div>
                            {res.subtitle && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{res.subtitle}</p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!loading && results.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground space-y-2">
                      <div className="text-base font-bold">No results found for "{query}"</div>
                      <div className="text-xs">Try searching in English or Arabic for characters, worlds, or story titles.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

