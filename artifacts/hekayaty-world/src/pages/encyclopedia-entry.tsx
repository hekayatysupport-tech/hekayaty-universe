import React from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, Book } from 'lucide-react';

export function EncyclopediaEntry({ params }: { params: { id: string } }) {
  // Simple mock implementation
  const entryName = params.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="w-full pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/encyclopedia" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm uppercase tracking-widest font-bold mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest">
              Archive Entry
            </span>
            <span className="text-muted-foreground font-bold tracking-widest text-sm uppercase flex items-center gap-2">
              <Book className="w-4 h-4" /> Authorized Access
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight text-glow">
            {entryName || 'The Ancient Pact'}
          </h1>
          
          <p className="text-xl md:text-2xl text-primary font-light leading-relaxed">
            Historical document regarding the foundational laws of the Sky Kingdoms.
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:font-light max-w-none border-l-2 border-primary pl-8 mt-12">
          <p>
            The Great Sundering left the world fractured. In order to survive the cataclysm, the floating archipelagos formed the Sky Vanguard. This pact, forged in the fires of the dying star, bound the champions to an eternal oath of protection.
          </p>
          <p>
            Any entity violating this pact is immediately branded a traitor to the cosmos and hunted by the Astral Guard.
          </p>
          <h3>Addendum: The Shadow Clause</h3>
          <p>
            Discovered during the 4th Era, the Shadow Clause allows temporary alliances with denizens of the Iron Vale in times of universal threat.
          </p>
        </div>
      </div>
    </div>
  );
}
