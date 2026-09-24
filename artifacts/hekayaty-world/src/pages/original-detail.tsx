import React, { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { Crown, BookOpen, Lock, Play, ChevronRight, User, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function OriginalDetail({ params }: { params?: { slug?: string } }) {
  const [, match] = useRoute('/originals/:slug');
  const slug = params?.slug || match?.slug || '';
  const { session } = useAuth();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/originals/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!item || item.error) {
    return (
      <div className="min-h-screen bg-background pt-32 px-4 text-center">
        <h1 className="text-4xl font-serif text-primary mb-4">Original Not Found</h1>
        <Link href="/originals" className="text-sm uppercase font-bold text-foreground hover:underline">
          Return to Originals Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      {/* Header Banner */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-card border border-border/80 shadow-2xl p-8 md:p-12">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
            style={{ backgroundImage: `url(${item.coverUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary text-black rounded-md flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Hekayaty Original
              </span>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-secondary text-foreground rounded-md border border-border">
                {item.contentType}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-white">
              {item.arabicTitle} <span className="text-2xl font-sans font-normal text-muted-foreground block md:inline">({item.title})</span>
            </h1>

            {item.tagline && <p className="text-lg text-primary italic font-serif">"{item.tagline}"</p>}

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {item.arabicDescription || item.description}
            </p>
          </div>
        </div>
      </div>

      {/* Linked Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Stories Section */}
        {item.stories && item.stories.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold border-b border-border pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Included Stories & Chapters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {item.stories.map((story: any) => (
                <div key={story.id} className="bg-card rounded-xl border border-border/80 p-6 space-y-4 hover:border-primary/50 transition-colors">
                  <div className="flex gap-4">
                    <img src={story.coverUrl || item.coverUrl} alt={story.title} className="w-20 h-28 object-cover rounded-lg" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-serif font-bold text-foreground">{story.arabicTitle}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{story.synopsis}</p>
                      <div className="text-xs text-primary font-semibold">Author: {story.authorName}</div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/stories`}
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      Read Story Chapters <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connected Characters */}
        {item.characters && item.characters.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold border-b border-border pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Key Characters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {item.characters.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/characters/${c.id}`}
                  className="bg-card rounded-lg p-3 border border-border flex items-center gap-3 hover:border-primary/50 transition-colors"
                >
                  <img src={c.portraitUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/tarek_portrait.jpg'} alt={c.name} className="w-12 h-12 object-cover rounded-full" />
                  <div>
                    <div className="text-sm font-bold font-serif text-foreground">{c.arabicName}</div>
                    <div className="text-xs text-muted-foreground">{c.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Connected Worlds */}
        {item.worlds && item.worlds.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold border-b border-border pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Connected Realms
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.worlds.map((w: any) => (
                <Link
                  key={w.id}
                  href={`/worlds/${w.id}`}
                  className="bg-card rounded-lg p-4 border border-border flex items-center gap-4 hover:border-primary/50 transition-colors"
                >
                  <img src={w.coverUrl} alt={w.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div>
                    <div className="text-base font-bold font-serif text-foreground">{w.arabicName}</div>
                    <div className="text-xs text-muted-foreground">{w.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
