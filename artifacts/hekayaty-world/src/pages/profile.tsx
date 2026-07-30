import React from 'react';
import { User, Library, Shield, Settings, LogOut } from 'lucide-react';

export function Profile() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="aspect-square bg-card border border-border flex items-center justify-center mb-6">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-6">Scholar_99</h2>
          
          <nav className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm flex items-center gap-3">
              <User className="w-4 h-4" /> Profile
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-card text-foreground font-bold uppercase tracking-wider text-sm flex items-center gap-3 border border-transparent hover:border-border transition-colors">
              <Library className="w-4 h-4" /> Collection
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-card text-foreground font-bold uppercase tracking-wider text-sm flex items-center gap-3 border border-transparent hover:border-border transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-destructive/10 text-destructive font-bold uppercase tracking-wider text-sm flex items-center gap-3 border border-transparent hover:border-destructive/30 transition-colors mt-8">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-12">
          <section className="bg-card border border-border p-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-8 border-b border-border pb-2">Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-serif font-bold text-foreground mb-2">12</div>
                <div className="text-xs uppercase font-bold text-muted-foreground">Comics Read</div>
              </div>
              <div>
                <div className="text-4xl font-serif font-bold text-foreground mb-2">45</div>
                <div className="text-xs uppercase font-bold text-muted-foreground">Cards Collected</div>
              </div>
              <div>
                <div className="text-4xl font-serif font-bold text-foreground mb-2">Rank 4</div>
                <div className="text-xs uppercase font-bold text-muted-foreground">TCG Ladder</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 border-b border-border pb-2">Recent Activity</h3>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border bg-card">
                  <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground"><span className="font-bold">You</span> unlocked the <span className="text-primary">Desert Wraith</span> legendary card.</p>
                    <p className="text-xs text-muted-foreground mt-1">{i * 2} hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
