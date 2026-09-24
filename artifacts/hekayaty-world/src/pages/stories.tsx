import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { BookOpen, Crown, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStories } from '@/lib/supabase-data';

export function Stories() {
  const { isSubscriber } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [chaptersMap, setChaptersMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories()
      .then(async (storyList) => {
        setStories(Array.isArray(storyList) ? storyList : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-serif font-extrabold text-foreground flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" /> Hekayaty Original Stories
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-2">
          Read long-form original narrative series, lore chroniclings, and character stories.
        </p>
      </div>

      <div className="space-y-12">
        {stories.map((story) => {
          const chapters = chaptersMap[story.id] || [];

          return (
            <div key={story.id} className="bg-card rounded-2xl border border-border/80 p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={story.coverUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/travelers_cover.jpg'}
                  alt={story.title}
                  className="w-full md:w-48 h-64 object-cover rounded-xl shadow-lg"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40 rounded">
                      Original Story Series
                    </span>
                    <span className="text-xs text-muted-foreground">Author: {story.authorName}</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                    {story.arabicTitle} <span className="text-lg font-sans font-normal text-muted-foreground">({story.title})</span>
                  </h2>

                  <p className="text-sm text-muted-foreground leading-relaxed">{story.synopsis}</p>
                </div>
              </div>

              {/* Chapters Listing */}
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Chapters Listing</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chapters.map((ch) => (
                    <Link
                      key={ch.id}
                      href={`/stories/chapters/${ch.id}`}
                      className="p-3 bg-secondary/40 hover:bg-secondary/80 rounded-lg border border-border/60 hover:border-primary/50 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary">
                          {ch.arabicTitle}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {ch.readTimeMinutes} min read
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {ch.accessLevel === 'subscriber' && !isSubscriber ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Premium
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
                            {isSubscriber ? 'Unlocked' : 'Free'}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
