import React, { useState } from 'react';
import { MOCK_CHARACTERS } from '@/data/characters';
import { getImageUrl } from '@/assets';
import { motion } from 'framer-motion';

export function CardGame() {
  const [filter, setFilter] = useState('All');
  const rarities = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

  // Mocking cards based on characters
  const cards = MOCK_CHARACTERS.map(c => ({
    ...c,
    rarity: c.alignment === 'Hero' || c.alignment === 'Villain' ? 'Legendary' : 'Epic',
    power: c.stats.strength + c.stats.magic
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">Trading Card Game</h1>
        <p className="text-xl text-muted-foreground font-light max-w-2xl">
          Build your deck. Dominate the Nexus. Browse the digital card database.
        </p>
      </div>

      <div className="flex gap-4 mb-12 border-b border-border pb-4 overflow-x-auto">
        {rarities.map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border ${
              filter === r 
                ? 'bg-primary text-primary-foreground border-primary box-glow' 
                : 'bg-transparent text-foreground border-border hover:border-primary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {cards.filter(c => filter === 'All' || c.rarity === filter).map(card => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05, y: -10 }}
            className={`relative aspect-[2.5/3.5] border-4 rounded-xl overflow-hidden cursor-pointer shadow-xl ${
              card.rarity === 'Legendary' ? 'border-yellow-500 shadow-yellow-500/20' : 
              card.rarity === 'Epic' ? 'border-purple-500 shadow-purple-500/20' : 
              'border-border'
            }`}
          >
            <img src={getImageUrl(card.imageKey)} alt={card.name} className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black border-2 border-current flex items-center justify-center font-bold text-white z-10" style={{ borderColor: 'inherit' }}>
              {Math.floor(card.power / 20)}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-3 text-center z-10">
              <h4 className="font-serif font-bold text-sm text-white mb-1 leading-tight">{card.name}</h4>
              <div className="text-[10px] text-white/80 uppercase tracking-widest bg-black/50 backdrop-blur rounded py-0.5 border border-white/20">
                {card.rarity}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
