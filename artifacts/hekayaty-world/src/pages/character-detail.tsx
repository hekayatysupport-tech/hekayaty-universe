import React from 'react';
import { useLocation } from 'wouter';
import { MOCK_CHARACTERS } from '@/data/characters';
import { getImageUrl } from '@/assets';
import { motion } from 'framer-motion';
import { Shield, Zap, Brain, Activity, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export function CharacterDetail({ params }: { params: { id: string } }) {
  const character = MOCK_CHARACTERS.find(c => c.id === params.id);

  if (!character) {
    return <div className="p-20 text-center text-xl">Entity not found.</div>;
  }

  const statIcons = {
    strength: <Shield className="w-4 h-4" />,
    magic: <Zap className="w-4 h-4" />,
    agility: <Activity className="w-4 h-4" />,
    intelligence: <Brain className="w-4 h-4" />,
    durability: <Heart className="w-4 h-4" />,
  };

  return (
    <div className="w-full pb-20">
      {/* Banner */}
      <div className="relative h-[50vh] md:h-[70vh] w-full bg-background border-b border-border">
        <div className="absolute inset-0">
          <img 
            src={getImageUrl(character.imageKey)} 
            alt={character.name}
            className="w-full h-full object-cover object-top opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        </div>

        <div className="absolute top-6 left-6 z-20">
          <Link href="/characters" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm uppercase tracking-widest font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Roster
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-7xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
             <span className="inline-block px-3 py-1 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest mb-4">
               {character.alignment}
             </span>
             <h1 className="text-5xl md:text-8xl font-serif font-bold text-foreground text-glow leading-none mb-2">
               {character.name}
             </h1>
             <p className="text-2xl md:text-4xl font-serif text-primary/80 mb-4">{character.arabicName}</p>
             <p className="text-xl md:text-2xl text-muted-foreground tracking-widest uppercase">{character.alias}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Biography</h2>
            <p className="text-lg text-foreground/90 leading-relaxed font-light whitespace-pre-wrap">
              {character.fullBio}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Abilities & Powers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {character.abilities.map((ability, i) => (
                <div key={i} className="p-4 bg-card border border-border flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-bold text-foreground">{ability}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
           {/* Portrait */}
           <div className="aspect-[3/4] border border-border p-2 bg-card relative">
              <img src={getImageUrl(character.imageKey)} alt={character.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-background px-2 py-1 text-xs uppercase font-bold border border-border flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${character.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                 {character.status}
              </div>
           </div>

           {/* Stats */}
           <div className="bg-card border border-border p-6">
             <h3 className="font-serif font-bold text-xl mb-6">Power Metrics</h3>
             <div className="space-y-4">
               {Object.entries(character.stats).map(([stat, value]) => (
                 <div key={stat}>
                   <div className="flex justify-between text-xs uppercase font-bold text-muted-foreground mb-1">
                     <span className="flex items-center gap-2">
                       {statIcons[stat as keyof typeof statIcons]} 
                       {stat}
                     </span>
                     <span>{value}/100</span>
                   </div>
                   <div className="h-1.5 w-full bg-background overflow-hidden rounded-full border border-border/50">
                     <motion.div 
                       className="h-full bg-primary"
                       initial={{ width: 0 }}
                       animate={{ width: `${value}%` }}
                       transition={{ duration: 1, ease: "easeOut" }}
                     />
                   </div>
                 </div>
               ))}
             </div>
           </div>

           {/* Metadata */}
           <div className="bg-card border border-border p-6 space-y-4">
             <div>
               <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Organization</h4>
               <p className="font-serif text-lg">{character.organization}</p>
             </div>
             <div>
               <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Power Category</h4>
               <p className="font-serif text-lg">{character.powerCategory}</p>
             </div>
             <div>
               <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">First Appearance</h4>
               <p className="font-serif text-lg text-primary underline cursor-pointer">Issue #{character.firstAppearance.replace('com', '')}</p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
