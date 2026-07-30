import React from 'react';
import { useLocation, Link } from 'wouter';
import { MOCK_WORLDS } from '@/data/worlds';
import { MOCK_CHARACTERS } from '@/data/characters';
import { getImageUrl } from '@/assets';
import { ArrowLeft, Map, Users, Sparkles, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export function WorldDetail({ params }: { params: { id: string } }) {
  const world = MOCK_WORLDS.find(w => w.id === params.id);
  
  if (!world) return <div className="p-20 text-center">World not found</div>;

  const charactersInWorld = MOCK_CHARACTERS.filter(c => c.worldId === world.id);

  return (
    <div className="w-full pb-20">
      <div className="relative h-[60vh] w-full">
        <img 
          src={getImageUrl(world.bannerImageKey)} 
          alt={world.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-20">
          <Link href="/worlds" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold drop-shadow-md">
            <ArrowLeft className="w-4 h-4" /> Back to Atlas
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-7xl mx-auto">
          <span className="inline-block px-3 py-1 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest mb-4">
            {world.type}
          </span>
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-white text-glow leading-none mb-2">
            {world.name}
          </h1>
          <p className="text-2xl md:text-4xl font-serif text-primary/80 mb-6">{world.arabicName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Overview</h2>
            <p className="text-xl text-foreground/90 leading-relaxed font-light">
              {world.description}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Notable Figures</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {charactersInWorld.length > 0 ? charactersInWorld.map(char => (
                <Link key={char.id} href={`/characters/${char.id}`}>
                  <div className="flex items-center gap-4 p-4 border border-border bg-card hover:border-primary cursor-pointer transition-colors group">
                    <img src={getImageUrl(char.imageKey)} alt={char.name} className="w-16 h-16 object-cover rounded-full border border-border group-hover:border-primary" />
                    <div>
                      <h4 className="font-serif font-bold text-lg group-hover:text-primary transition-colors">{char.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase">{char.alias}</p>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="text-muted-foreground italic">No registered entities from this world currently in the database.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border p-6">
             <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2">
               <Map className="w-5 h-5 text-primary" /> World Statistics
             </h3>
             <div className="space-y-6">
               <div>
                 <div className="text-xs uppercase font-bold text-muted-foreground mb-1 flex items-center gap-2">
                   <Users className="w-4 h-4" /> Population
                 </div>
                 <p className="font-serif text-2xl">{world.stats.population}</p>
               </div>
               <div>
                 <div className="text-xs uppercase font-bold text-muted-foreground mb-1 flex items-center gap-2">
                   <Sparkles className="w-4 h-4" /> Magic Level
                 </div>
                 <p className="font-serif text-2xl text-primary">{world.stats.magicLevel}</p>
               </div>
               <div>
                 <div className="text-xs uppercase font-bold text-muted-foreground mb-1 flex items-center gap-2">
                   <Wrench className="w-4 h-4" /> Technology
                 </div>
                 <p className="font-serif text-2xl">{world.stats.techLevel}</p>
               </div>
             </div>
          </div>

          <div className="bg-card border border-border p-6">
             <h3 className="font-serif font-bold text-xl mb-4">Major Factions</h3>
             <ul className="space-y-3">
               {world.majorFactions.map(faction => (
                 <li key={faction} className="flex items-center gap-3 text-lg font-light">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   {faction}
                 </li>
               ))}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
