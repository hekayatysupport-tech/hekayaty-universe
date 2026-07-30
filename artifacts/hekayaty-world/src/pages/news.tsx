import React from 'react';
import { MOCK_NEWS } from '@/data/misc';
import { getImageUrl } from '@/assets';
import { Link } from 'wouter';

export function News() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-16 border-b border-border pb-8">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">Latest Dispatches</h1>
        <p className="text-xl text-muted-foreground font-light">
          Announcements, releases, and updates from the creators of Hekayaty.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Featured Article */}
        <div className="lg:col-span-2">
          {MOCK_NEWS.slice(0,1).map(article => (
            <Link key={article.id} href={`/news/${article.id}`}>
              <div className="group cursor-pointer">
                <div className="aspect-video w-full overflow-hidden border border-border bg-card mb-6">
                  <img src={getImageUrl(article.imageKey)} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">{article.category}</span>
                  <span className="text-muted-foreground text-xs">{new Date(article.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-4xl font-serif font-bold mb-4 group-hover:text-primary transition-colors">{article.title}</h2>
                <p className="text-xl text-muted-foreground font-light">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar Articles */}
        <div className="flex flex-col gap-8">
          <h3 className="font-serif text-2xl font-bold border-b border-border pb-4">More News</h3>
          {MOCK_NEWS.slice(1).map(article => (
            <Link key={article.id} href={`/news/${article.id}`}>
              <div className="group cursor-pointer grid grid-cols-3 gap-4">
                <div className="col-span-1 aspect-square border border-border overflow-hidden bg-card">
                  <img src={getImageUrl(article.imageKey)} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="col-span-2 flex flex-col justify-center">
                  <div className="text-xs text-primary font-bold uppercase tracking-widest mb-2">{article.category}</div>
                  <h4 className="font-serif font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-2">{article.title}</h4>
                  <span className="text-muted-foreground text-xs">{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
