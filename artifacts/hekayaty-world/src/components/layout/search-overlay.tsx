import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, BookOpen, User, Globe } from 'lucide-react';
import { useAppStore } from '@/store';
import { MOCK_CHARACTERS } from '@/data/characters';
import { MOCK_WORLDS } from '@/data/worlds';
import { Link, useLocation } from 'wouter';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useAppStore();
  const [query, setQuery] = React.useState('');
  const [_, setLocation] = useLocation();

  const handleClose = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const filteredCharacters = MOCK_CHARACTERS.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredWorlds = MOCK_WORLDS.filter(w => w.name.toLowerCase().includes(query.toLowerCase())).slice(0, 2);

  const navigate = (path: string) => {
    setLocation(path);
    handleClose();
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
          <div className="max-w-4xl w-full mx-auto p-6 md:p-12 flex-1 flex flex-col">
            <div className="flex justify-end mb-8">
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-secondary text-foreground transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search heroes, worlds, lore..."
                className="w-full bg-transparent border-b-2 border-border focus:border-primary text-4xl md:text-6xl font-serif text-foreground outline-none py-6 pl-20 placeholder:text-muted-foreground/50 transition-colors"
                autoFocus
              />
            </div>

            <div className="mt-12 flex-1 overflow-y-auto">
              {!query ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Trending Searches</h3>
                    <div className="flex flex-wrap gap-3">
                      {['Al-Saqr Armor', 'Sunken Citadel Map', 'Cosmic Classes', 'Desert Wraith Origin'].map(t => (
                        <button key={t} onClick={() => setQuery(t)} className="px-4 py-2 rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-sm">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Explore Categories</h3>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => navigate('/characters')} className="flex items-center gap-4 text-xl font-serif hover:text-primary group">
                        <User className="w-6 h-6 opacity-50 group-hover:opacity-100" /> Characters <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button onClick={() => navigate('/worlds')} className="flex items-center gap-4 text-xl font-serif hover:text-primary group">
                        <Globe className="w-6 h-6 opacity-50 group-hover:opacity-100" /> Worlds <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button onClick={() => navigate('/encyclopedia')} className="flex items-center gap-4 text-xl font-serif hover:text-primary group">
                        <BookOpen className="w-6 h-6 opacity-50 group-hover:opacity-100" /> Encyclopedia <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  {filteredCharacters.length > 0 && (
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Characters</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCharacters.map(char => (
                          <div 
                            key={char.id}
                            onClick={() => navigate(`/characters/${char.id}`)}
                            className="p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors flex items-center gap-4 group"
                          >
                            <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
                               {/* Placeholder for image */}
                               <div className="w-full h-full bg-primary/20"></div>
                            </div>
                            <div>
                              <h4 className="font-serif font-bold group-hover:text-primary transition-colors">{char.name}</h4>
                              <p className="text-xs text-muted-foreground">{char.alias}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredWorlds.length > 0 && (
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">Worlds</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {filteredWorlds.map(world => (
                          <div 
                            key={world.id}
                            onClick={() => navigate(`/worlds/${world.id}`)}
                            className="p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors"
                          >
                            <h4 className="font-serif font-bold hover:text-primary transition-colors">{world.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{world.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredCharacters.length === 0 && filteredWorlds.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                      No results found for "{query}". Try searching for something else.
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
