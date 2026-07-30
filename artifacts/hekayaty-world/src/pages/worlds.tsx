import React from 'react';
import { MOCK_WORLDS } from '@/data/worlds';
import { getImageUrl } from '@/assets';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export function Worlds() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">Universe Atlas</h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-light">
          Explore the myriad realms, planets, and dimensions that make up the Hekayaty Universe. 
          Each world holds its own ancient secrets, unique civilizations, and looming threats.
        </p>
      </div>

      <div className="space-y-12">
        {MOCK_WORLDS.map((world, i) => (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/worlds/${world.id}`}>
              <div className="group relative w-full h-[400px] md:h-[500px] overflow-hidden border border-border hover:border-primary cursor-pointer transition-colors block">
                <img 
                  src={getImageUrl(world.bannerImageKey)} 
                  alt={world.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-primary/20 backdrop-blur-md text-primary font-bold text-xs uppercase tracking-widest border border-primary/30">
                      {world.type}
                    </span>
                    <span className="text-xs uppercase font-bold text-white/60 tracking-widest">
                      Pop: {world.stats.population}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-white group-hover:text-primary transition-colors mb-2 text-glow">
                    {world.name}
                  </h2>
                  <p className="text-xl md:text-2xl font-serif text-white/80 mb-6">{world.arabicName}</p>
                  <p className="text-lg text-white/90 font-light line-clamp-2 md:line-clamp-none">
                    {world.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
