import React from 'react';
import { useLocation, Link } from 'wouter';
import { MOCK_COMICS } from '@/data/comics';
import { MOCK_CHARACTERS } from '@/data/characters';
import { getImageUrl } from '@/assets';
import { ArrowLeft, BookOpen, ShoppingCart } from 'lucide-react';

export function ComicDetail({ params }: { params: { id: string } }) {
  const comic = MOCK_COMICS.find(c => c.id === params.id);
  
  if (!comic) return <div className="p-20 text-center">Comic not found</div>;

  const charactersInComic = MOCK_CHARACTERS.filter(c => comic.characterIds.includes(c.id));

  return (
    <div className="w-full pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/comics" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm uppercase tracking-widest font-bold mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Cover Art */}
          <div className="lg:col-span-4">
            <div className="relative aspect-[2/3] border border-border shadow-2xl bg-card">
              <img 
                src={getImageUrl(comic.coverImageKey)} 
                alt={comic.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
               <button className="w-full py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors box-glow">
                 <ShoppingCart className="w-5 h-5" /> Buy Digital • ${comic.price}
               </button>
               <button className="w-full py-4 bg-transparent border border-primary text-primary font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-primary/10 transition-colors">
                 <BookOpen className="w-5 h-5" /> Read Sample
               </button>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest border border-border">
                {comic.series}
              </span>
              <span className="text-muted-foreground font-bold text-sm uppercase">Issue #{comic.issueNumber}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-2 text-glow">
              {comic.title}
            </h1>
            <p className="text-3xl font-serif text-primary/80 mb-8">{comic.arabicTitle}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-border mb-10">
              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Writer</h4>
                <p className="font-serif text-lg">{comic.writer}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Artist</h4>
                <p className="font-serif text-lg">{comic.artist}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Release Date</h4>
                <p className="font-serif text-lg">{new Date(comic.releaseDate).toLocaleDateString()}</p>
              </div>
            </div>

            <section className="mb-12">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Synopsis</h2>
              <p className="text-xl text-foreground/90 leading-relaxed font-light">
                {comic.synopsis}
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Characters in this Issue</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {charactersInComic.map(char => (
                  <Link key={char.id} href={`/characters/${char.id}`}>
                    <div className="flex items-center gap-4 p-3 border border-border bg-card hover:border-primary cursor-pointer transition-colors group">
                      <img src={getImageUrl(char.imageKey)} alt={char.name} className="w-12 h-12 object-cover rounded-full border border-border" />
                      <div>
                        <h4 className="font-serif font-bold group-hover:text-primary transition-colors">{char.name}</h4>
                        <p className="text-xs text-muted-foreground">{char.alias}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
