import React, { useState } from 'react';
import { useGetCharacters } from '@workspace/api-client-react';
import { DiscoveryEngine } from '@/components/universe/DiscoveryEngine';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Filter, Search, Zap, Sparkles } from 'lucide-react';
import { calculatePowerRating } from '@/utils/powerRating';

export function Characters() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: charactersData, isLoading, error } = useGetCharacters();
  const characters = Array.isArray(charactersData) ? charactersData : [];

  const alignments = ['All', 'Hero', 'Villain', 'Antihero', 'Neutral'];

  const filtered = characters.filter(c => 
    (filter === 'All' || c.alignment === filter) &&
    ((c.name && c.name.toLowerCase().includes(search.toLowerCase())) || 
     (c.arabicName && c.arabicName.includes(search)) ||
     (c.alias && c.alias.toLowerCase().includes(search.toLowerCase())))
  );

  if (isLoading) {
    return (
      <div className="p-20 text-center text-xl text-primary h-screen bg-background flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif">جاري استدعاء سجل الشخصيات الأسطورية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-20 text-center text-xl text-foreground h-screen bg-background">حدث خطأ أثناء جلب الشخصيات.</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16 text-right" dir="rtl">
        <div className="inline-block px-3 py-1 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest bg-primary/5 rounded mb-3">
          سجل الأبطال والشخصيات
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground mb-4">
          شخصيات عالم حكاياتي
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          استكشف الأبطال، الخصوم، ومعدلات القوة الشاملة والقدرات الأسطورية لكل شخصية في الكون.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex flex-wrap gap-2">
          {alignments.map(a => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-none border transition-all ${
                filter === a 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو اللقب..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground px-10 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map((char, i) => {
          const powerRating = calculatePowerRating((char as any).stats);

          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/characters/${char.id}`}>
                <div className="group relative bg-card border border-border hover:border-primary/60 transition-all duration-300 cursor-pointer overflow-hidden h-[440px] flex flex-col rounded-xl shadow-lg hover:shadow-2xl hover:shadow-primary/10">
                  <div className="relative h-2/3 overflow-hidden">
                    <img 
                      src={char.portraitUrl || ''} 
                      alt={char.name || ''}
                      className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/40"></div>
                    
                    {/* Alignment Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase border border-border rounded">
                      {char.alignment}
                    </div>

                    {/* Smart Power Score Badge (0-100) */}
                    <div 
                      className="absolute top-3 left-3 px-2.5 py-1 backdrop-blur-md text-[11px] font-mono font-black border rounded-lg flex items-center gap-1 shadow"
                      style={{
                        backgroundColor: `${powerRating.tier.color}20`,
                        borderColor: `${powerRating.tier.color}60`,
                        color: powerRating.tier.color,
                      }}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{powerRating.score}/100</span>
                      <span className="text-[9px] uppercase opacity-75">· {powerRating.tier.rank}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col relative z-10 -mt-6 text-right" dir="rtl">
                    <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {char.arabicName || char.name}
                    </h3>
                    <p className="text-xs text-primary mb-3 font-bold tracking-widest uppercase truncate">
                      {char.alias || char.name}
                    </p>
                    
                    <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border/40">
                      <span className="truncate text-foreground/80 font-medium">
                        {powerRating.archetype.icon} {powerRating.archetype.titleArabic}
                      </span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: powerRating.tier.color }}>
                        {powerRating.tier.titleArabic}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 border border-border border-dashed rounded-xl">
          <p className="text-muted-foreground text-lg">لم يتم العثور على شخصيات تطابق خيارات البحث.</p>
        </div>
      )}

      <DiscoveryEngine />
    </div>
  );
}
