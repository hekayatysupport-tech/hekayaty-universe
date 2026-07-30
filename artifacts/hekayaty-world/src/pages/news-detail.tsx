import React from 'react';
import { MOCK_NEWS } from '@/data/misc';
import { getImageUrl } from '@/assets';
import { ArrowLeft, Share2, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

export function NewsDetail({ params }: { params: { id: string } }) {
  const article = MOCK_NEWS.find(n => n.id === params.id);

  if (!article) return <div className="p-20 text-center">Article not found</div>;

  return (
    <div className="w-full pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/news" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm uppercase tracking-widest font-bold mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest">
              {article.category}
            </span>
            <span className="text-muted-foreground font-bold tracking-widest text-sm uppercase">
              {new Date(article.date).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="aspect-[21/9] w-full border border-border overflow-hidden bg-card mb-12">
          <img src={getImageUrl(article.imageKey)} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:font-light max-w-none">
          <p>
            The expansion of the Hekayaty Universe continues. Fans have been eagerly anticipating this update, which brings new depth to the lore and expands the roster of heroes.
          </p>
          <h3>A New Era</h3>
          <p>
            With the upcoming release schedule locked in, we can expect monthly comic drops alongside weekly lore expansions in the Encyclopedia. The creative team has stated that the next major arc will focus heavily on the political intrigue within the Sky Kingdoms.
          </p>
          <blockquote>
            "We want readers to feel the weight of every decision these characters make. The universe is vast, but it's the personal stakes that make it matter." — Lead Writer
          </blockquote>
          <p>
            Stay tuned for more updates as we approach the convention season.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
           <div className="flex gap-4">
             <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-sm">
               <Share2 className="w-4 h-4" /> Share
             </button>
           </div>
           <div className="flex gap-4">
             <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-sm">
               <MessageSquare className="w-4 h-4" /> 24 Comments
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
