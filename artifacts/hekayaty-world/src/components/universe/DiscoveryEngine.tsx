import React from 'react';
import { Link } from 'wouter';
import { Sparkles, ArrowRight, Zap, Globe, BookOpen, Clock } from 'lucide-react';
import { useGetCharacters, useGetWorlds, useGetComics } from '@workspace/api-client-react';

export interface ConnectedNode {
  id: string;
  type: 'character' | 'world' | 'story' | 'novel' | 'comic' | 'event' | 'card' | 'encyclopedia';
  title: string;
  arabicTitle: string;
  category?: string;
  imageUrl?: string;
  link: string;
}

interface DiscoveryEngineProps {
  currentTitle?: string;
  arabicCurrentTitle?: string;
  connectedNodes?: ConnectedNode[];
}

export function DiscoveryEngine({ connectedNodes }: DiscoveryEngineProps) {
  const { data: charactersData } = useGetCharacters();
  const { data: worldsData } = useGetWorlds();
  const { data: comicsData } = useGetComics();

  const characters = Array.isArray(charactersData) ? charactersData : [];
  const worlds = Array.isArray(worldsData) ? worldsData : [];
  const comics = Array.isArray(comicsData) ? comicsData : [];

  // Build dynamic nodes from real DB entities if no explicit props passed
  const dynamicNodes: ConnectedNode[] = [];

  if (characters.length > 0) {
    const c = characters[0];
    if (c && c.id) {
      dynamicNodes.push({
        id: c.id,
        type: 'character',
        title: c.name || 'Character',
        arabicTitle: c.arabicName || c.name || 'شخصية',
        category: c.powerCategory || 'Primary Hero',
        imageUrl: c.portraitUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/tarek_portrait.jpg',
        link: `/characters/${c.id}`,
      });
    }
  }

  if (worlds.length > 0) {
    const w = worlds[0];
    if (w && w.id) {
      dynamicNodes.push({
        id: w.id,
        type: 'world',
        title: (w as any).worldName || w.name || 'World',
        arabicTitle: (w as any).worldArabicName || w.arabicName || w.name || 'عالم',
        category: 'Core World',
        imageUrl: w.coverUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/egypt_cover.jpg',
        link: `/worlds/${w.id}`,
      });
    }
  }

  if (comics.length > 0) {
    const cm = comics[0];
    if (cm && cm.id) {
      dynamicNodes.push({
        id: cm.id,
        type: 'comic',
        title: cm.title || 'Comic',
        arabicTitle: cm.arabicTitle || cm.title || 'قصة مصورة',
        category: 'Comic Series',
        imageUrl: cm.coverUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/crossers_vol1_cover.jpg',
        link: `/comics/${cm.id}`,
      });
    }
  }

  if (characters.length > 1) {
    const c2 = characters[1];
    if (c2 && c2.id) {
      dynamicNodes.push({
        id: c2.id,
        type: 'character',
        title: c2.name || 'Character',
        arabicTitle: c2.arabicName || c2.name || 'شخصية',
        category: c2.powerCategory || 'Hero',
        imageUrl: c2.portraitUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/layan_portrait.jpg',
        link: `/characters/${c2.id}`,
      });
    }
  }

  const nodesToDisplay = connectedNodes && connectedNodes.length > 0 ? connectedNodes : dynamicNodes;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'character': return <Zap className="w-4 h-4 text-primary" />;
      case 'world': return <Globe className="w-4 h-4 text-amber-400" />;
      case 'story':
      case 'novel': return <BookOpen className="w-4 h-4 text-amber-200" />;
      case 'event': return <Clock className="w-4 h-4 text-primary" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <section className="mt-20 pt-16 pb-12 border-t border-primary/20 bg-gradient-to-b from-background via-card/50 to-background rounded-3xl px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4" dir="rtl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" /> محرك الاستكشاف اللانهائي
          </div>
          <h3 className="text-3xl font-serif font-black text-foreground">
            صلات أخرى في هذا الكون
          </h3>
          <p className="text-muted-foreground text-sm max-w-xl mt-1">
            لا تنتهي الرحلة هنا. استكشف الشخصيات والعوالم والأحداث المتصلة مباشرة بهذه الصفحة.
          </p>
        </div>

        <Link href="/universe" className="px-5 py-2.5 bg-primary/10 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-black transition-all flex items-center gap-2 rounded-lg">
          <span>خريطة الكون التفاعلية</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {nodesToDisplay.map((node) => (
          <Link key={node.id} href={node.link}>
            <div className="group relative bg-card border border-border hover:border-primary/60 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-primary/10 cursor-pointer flex flex-col h-full">
              {node.imageUrl && (
                <div className="h-44 overflow-hidden relative">
                  <img src={node.imageUrl} alt={node.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-background/80 backdrop-blur-md border border-border text-[10px] font-bold uppercase text-foreground rounded-full flex items-center gap-1.5">
                    {getTypeIcon(node.type)}
                    <span>{node.type}</span>
                  </div>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col justify-between" dir="rtl">
                <div>
                  <div className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                    {node.category || 'عقدة في الكون'}
                  </div>
                  <h4 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {node.arabicTitle || node.title}
                  </h4>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary font-bold">
                  <span>استكشف الصلة</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 transform group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
