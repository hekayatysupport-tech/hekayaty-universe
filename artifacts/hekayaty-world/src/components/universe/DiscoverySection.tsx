import { Link } from "wouter";
import { Sparkles, ArrowRight, ShieldCheck, BookOpen, Swords, Globe, Layers, Feather } from "lucide-react";

interface DiscoverySectionProps {
  currentCategory?: string;
  relatedItems?: Array<{
    id: string;
    type: "character" | "world" | "comic" | "story" | "novel" | "event" | "card";
    title: string;
    subtitle?: string;
    imageUrl?: string;
    link: string;
  }>;
}

export function DiscoverySection({ currentCategory = "Hekayaty Universe", relatedItems }: DiscoverySectionProps) {
  const defaultItems = [
    {
      id: "disc-1",
      type: "character",
      title: "Saqr (صقر - The Falcon)",
      subtitle: "High Guardian of the Veil",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/saqr_portrait.jpg",
      link: "/characters/saqr",
    },
    {
      id: "disc-2",
      type: "world",
      title: "Ancient Egypt Realm",
      subtitle: "Land of Pharaohs & Solar Magic",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/egypt_cover.jpg",
      link: "/worlds/egypt",
    },
    {
      id: "disc-3",
      type: "story",
      title: "The Crossers (المعبرون)",
      subtitle: "Flagship Fantasy Saga",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/travelers_cover.jpg",
      link: "/stories/travelers",
    },
    {
      id: "disc-4",
      type: "comic",
      title: "Dawn of the Veil #1",
      subtitle: "Subscriber Exclusive Issue",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/cover1.jpg",
      link: "/comics/1",
    },
  ];

  const items = relatedItems && relatedItems.length > 0 ? relatedItems : (defaultItems as any);

  return (
    <section className="py-12 border-t border-border/60 mt-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Universe Discovery Engine
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Explore Connected Content
          </h3>
        </div>

        <Link href="/universe" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary hover:underline">
          Open Interactive Universe Map <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item: any) => (
          <Link key={item.id} href={item.link}>
            <div className="group relative bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full">
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                  {item.type}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Discover Connection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
