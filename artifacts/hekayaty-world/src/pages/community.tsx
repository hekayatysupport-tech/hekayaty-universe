import React from 'react';
import { Users, MessageSquare, Heart, TrendingUp } from 'lucide-react';

export function Community() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-12 flex justify-between items-end border-b border-border pb-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">Community Hub</h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl">
            Join the discussion. Share theories, fan art, and connect with other scholars of the universe.
          </p>
        </div>
        <button className="hidden md:block px-6 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors box-glow">
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4" /> Trending Discussions
          </h2>
          
          {[1,2,3,4,5].map(i => (
            <div key={i} className="p-6 bg-card border border-border hover:border-primary transition-colors cursor-pointer group">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary shrink-0 border border-border"></div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors mb-2">
                    {i === 1 ? "Theory: The true identity of the Desert Wraith" : "What happens after Issue #12?"}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    I was re-reading the Wandering Sands arc and noticed a detail in the background of panel 4 on page 12...
                  </p>
                  <div className="flex gap-6 text-xs text-muted-foreground font-bold uppercase">
                    <span className="flex items-center gap-1 hover:text-primary"><Heart className="w-3 h-3" /> {120 * i}</span>
                    <span className="flex items-center gap-1 hover:text-primary"><MessageSquare className="w-3 h-3" /> {45 * i}</span>
                    <span>Posted 2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Top Scholars</h2>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="font-serif text-lg font-bold text-muted-foreground">#{i}</div>
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border"></div>
                    <span className="font-bold">User_{i}99</span>
                  </div>
                  <span className="text-xs text-primary font-bold">{10000 / i} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
