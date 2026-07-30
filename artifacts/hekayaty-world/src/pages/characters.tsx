import React, { useState } from 'react';
import { MOCK_CHARACTERS } from '@/data/characters';
import { getImageUrl } from '@/assets';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';

export function Characters() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const alignments = ['All', 'Hero', 'Villain', 'Antihero', 'Neutral'];

  const filtered = MOCK_CHARACTERS.filter(c => 
    (filter === 'All' || c.alignment === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.alias.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">The Roster</h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-light">
          Browse the complete database of known entities across the Hekayaty universe. From cosmic guardians to abyssal terrors.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-border">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
          {alignments.map(a => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                filter === a 
                  ? 'bg-primary text-primary-foreground border-primary box-glow' 
                  : 'bg-transparent text-foreground border-border hover:border-primary'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search roster..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground px-10 py-2 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/characters/${char.id}`}>
              <div className="group relative bg-card border border-border hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden h-[420px] flex flex-col">
                <div className="relative h-2/3 overflow-hidden">
                   <img 
                     src={getImageUrl(char.imageKey)} 
                     alt={char.name}
                     className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                   
                   <div className="absolute top-3 right-3 px-2 py-1 bg-background/80 backdrop-blur text-xs font-bold uppercase border border-border">
                     {char.alignment}
                   </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col relative z-10 -mt-8">
                  <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{char.name}</h3>
                  <p className="text-sm text-primary mb-3 font-bold tracking-widest uppercase">{char.alias}</p>
                  
                  <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground">
                    <span className="truncate">{char.organization}</span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${char.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {char.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 border border-border border-dashed">
          <p className="text-muted-foreground text-lg">No entities match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
