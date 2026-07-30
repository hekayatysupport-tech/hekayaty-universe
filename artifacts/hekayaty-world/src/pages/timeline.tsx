import React, { useState } from 'react';
import { MOCK_TIMELINE } from '@/data/misc';
import { motion } from 'framer-motion';

export function Timeline() {
  const [activeEvent, setActiveEvent] = useState(MOCK_TIMELINE[0].id);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col h-[calc(100vh-80px)]">
      <div className="mb-12 shrink-0">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-4 text-glow">The Chronicles</h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-light">
          Trace the history of the universe from the forging of the first stars to the modern era of heroes.
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 min-h-0">
        
        {/* Timeline Scroll */}
        <div className="lg:w-1/3 overflow-y-auto pr-4 space-y-6 hide-scrollbar relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border z-0"></div>
          
          {MOCK_TIMELINE.map((event) => (
            <div 
              key={event.id}
              onClick={() => setActiveEvent(event.id)}
              className={`relative z-10 pl-12 py-4 cursor-pointer transition-all ${activeEvent === event.id ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-100'}`}
            >
              <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                activeEvent === event.id ? 'bg-primary border-primary box-glow' : 'bg-background border-muted-foreground'
              }`}></div>
              <div className={`text-sm font-bold tracking-widest uppercase mb-1 transition-colors ${
                activeEvent === event.id ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {event.year}
              </div>
              <h3 className="font-serif text-xl font-bold">{event.title}</h3>
            </div>
          ))}
        </div>

        {/* Event Detail Panel */}
        <div className="lg:w-2/3 bg-card border border-border p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          {MOCK_TIMELINE.map((event) => activeEvent === event.id && (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10"
            >
              <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest border border-border mb-6">
                Category: {event.category}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-glow">
                {event.title}
              </h2>
              <div className="text-xl font-serif text-primary mb-8 border-b border-border pb-8 inline-block pr-12">
                Date: {event.year}
              </div>
              <p className="text-2xl text-foreground/90 font-light leading-relaxed max-w-3xl">
                {event.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
