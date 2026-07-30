import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/assets';
import { Link } from 'wouter';
import { ArrowRight, ChevronRight, Shield, Zap, Swords, Globe } from 'lucide-react';
import { MOCK_CHARACTERS } from '@/data/characters';
import { MOCK_COMICS } from '@/data/comics';
import { MOCK_WORLDS } from '@/data/worlds';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export function Home() {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={getImageUrl('hero-bg.jpg')} 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center opacity-60 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
        </div>

        <motion.div 
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="mb-4">
            <span className="text-primary font-bold tracking-[0.3em] uppercase text-sm drop-shadow-md">
              Enter The Universe
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-white drop-shadow-2xl mb-2 text-glow">
            HEKAYATY
          </motion.h1>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-serif font-bold text-primary/80 mb-8 tracking-widest drop-shadow-lg">
            عالم حكاياتي
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 font-sans font-light leading-relaxed">
            Where ancient myth meets futuristic power. Discover the heroes, explore the worlds, and read the legends.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/comics" className="px-8 py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm rounded-none hover:bg-primary/90 transition-all hover:scale-105 box-glow w-full sm:w-auto text-center">
              Start Reading
            </Link>
            <Link href="/characters" className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold uppercase tracking-wider text-sm rounded-none hover:bg-white/10 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2">
              Explore Characters <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Characters */}
      <section className="py-24 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Legends Born</h2>
              <p className="text-muted-foreground mt-4 font-light max-w-lg">Meet the champions and villains shaping the destiny of the cosmos.</p>
            </div>
            <Link href="/characters" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline tracking-wide uppercase text-sm">
              View All Roster <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_CHARACTERS.slice(0, 3).map((char, i) => (
              <motion.div 
                key={char.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative h-[500px] overflow-hidden rounded-sm cursor-pointer border border-border hover:border-primary transition-colors duration-500"
              >
                <Link href={`/characters/${char.id}`}>
                  <div className="absolute inset-0">
                    <img 
                      src={getImageUrl(char.imageKey)} 
                      alt={char.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        {char.alignment}
                      </span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white group-hover:text-primary transition-colors">{char.name}</h3>
                    <p className="text-white/60 font-serif text-lg mb-4">{char.arabicName}</p>
                    <p className="text-white/80 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {char.shortBio}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Worlds / Map Teaser */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">A Universe Without Borders</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-light">
                From the floating archipelagos of the Sky Kingdoms to the crushing depths of the Sunken Citadel. Every realm holds ancient secrets, powerful artifacts, and looming threats.
              </p>
              <div className="space-y-6 mb-8">
                {MOCK_WORLDS.slice(0,3).map(world => (
                   <Link key={world.id} href={`/worlds/${world.id}`}>
                     <div className="group flex items-center justify-between p-4 border-b border-border hover:border-primary transition-colors cursor-pointer">
                       <div>
                         <h4 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">{world.name}</h4>
                         <p className="text-sm text-muted-foreground">{world.type}</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-2 transition-all" />
                     </div>
                   </Link>
                ))}
              </div>
              <Link href="/worlds" className="inline-block px-8 py-4 bg-transparent border border-primary text-primary font-bold uppercase tracking-wider text-sm hover:bg-primary hover:text-primary-foreground transition-all">
                Open The Atlas
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative h-[600px] border border-border p-4 bg-background"
            >
              <div className="absolute inset-4 overflow-hidden">
                 <img src={getImageUrl('world-sky.jpg')} alt="Sky Kingdoms" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                 <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <Globe className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                 <span className="font-serif text-2xl text-primary/80 tracking-[0.2em] uppercase">Sector 4</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Comics Scroll */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">The Library</h2>
            <p className="text-muted-foreground mt-4 font-light">Read the latest issues and epic crossovers.</p>
          </div>
          <Link href="/comics" className="flex items-center gap-2 text-primary font-bold hover:underline tracking-wide uppercase text-sm">
            All Comics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-8 px-4 sm:px-8 pb-12 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {MOCK_COMICS.map((comic, i) => (
            <motion.div 
              key={comic.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="snap-center shrink-0 w-[280px] sm:w-[320px] group"
            >
              <Link href={`/comics/${comic.id}`}>
                <div className="relative aspect-[2/3] mb-6 overflow-hidden border border-border group-hover:border-primary transition-colors shadow-lg">
                  <img src={getImageUrl(comic.coverImageKey)} alt={comic.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    Issue #{comic.issueNumber}
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">{comic.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{comic.series}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
