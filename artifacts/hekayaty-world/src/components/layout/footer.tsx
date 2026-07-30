import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-2xl font-bold tracking-wider text-primary mb-4 text-glow">HEKAYATY WORLD</h2>
            <p className="text-muted-foreground max-w-sm">
              The official digital hub for the largest Arabic superhero and fantasy franchise. Explore the lore, read the comics, and join the community.
            </p>
            <div className="mt-6 flex space-x-4">
               <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary cursor-pointer transition-colors">X</div>
               <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary cursor-pointer transition-colors">IG</div>
               <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary cursor-pointer transition-colors">YT</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><Link href="/comics" className="text-muted-foreground hover:text-primary transition-colors">Comics Library</Link></li>
              <li><Link href="/characters" className="text-muted-foreground hover:text-primary transition-colors">Characters</Link></li>
              <li><Link href="/worlds" className="text-muted-foreground hover:text-primary transition-colors">Universe Atlas</Link></li>
              <li><Link href="/card-game" className="text-muted-foreground hover:text-primary transition-colors">Card Game</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Hekayaty World. All rights reserved.</p>
          <div className="text-sm text-muted-foreground flex gap-4">
            <span>Made with magic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
