import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

interface GraphNode {
  id: string;
  type: string;
  name: string;
  arabicName: string;
  category: string;
  image?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

const PRESET_POSITIONS = [
  { x: 50, y: 38 },
  { x: 25, y: 62 },
  { x: 75, y: 32 },
  { x: 50, y: 78 },
  { x: 82, y: 72 },
  { x: 18, y: 32 },
  { x: 68, y: 58 },
  { x: 35, y: 22 },
];

export function UniverseGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch('/api/universe/graph');
        if (res.ok) {
          const data = await res.json();
          if (data.nodes && Array.isArray(data.nodes)) {
            const positioned = data.nodes.slice(0, 8).map((node: any, idx: number) => ({
              ...node,
              x: PRESET_POSITIONS[idx % PRESET_POSITIONS.length].x,
              y: PRESET_POSITIONS[idx % PRESET_POSITIONS.length].y,
            }));
            setNodes(positioned);
            setLinks(data.links || []);
            if (positioned.length > 0) {
              setSelectedNode(positioned[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load universe graph:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  return (
    <div className="w-full bg-card/80 backdrop-blur-xl border border-primary/30 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4" dir="rtl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase rounded-full mb-2">
            <Compass className="w-4 h-4 animate-spin-slow" /> خريطة المعرفة الكونية المتفاعلة
          </div>
          <h2 className="text-3xl font-serif font-black text-foreground">
            شبكة روابط HEKAYATY UNIVERSE
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            اضغط على أي عقدة لاستكشاف الروابط المباشرة بين الأبطال، العوالم، والأحداث التاريخية.
          </p>
        </div>
      </div>

      {/* SVG Canvas for Lines */}
      <div className="relative w-full h-[420px] bg-background/60 rounded-2xl border border-border/60 overflow-hidden flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-primary font-serif text-sm">
            <Sparkles className="w-8 h-8 animate-spin" />
            <span>جاري تحميل شبكة روابط الكون...</span>
          </div>
        ) : (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {links.map((conn, i) => {
                const source = nodes.find((n) => n.id === conn.source);
                const target = nodes.find((n) => n.id === conn.target);
                if (!source || !target || source.x === undefined || target.x === undefined) return null;
                return (
                  <line
                    key={i}
                    x1={`${source.x}%`}
                    y1={`${source.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke="rgba(212, 175, 55, 0.35)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <motion.button
                key={node.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedNode(node)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2 shadow-xl ${
                  selectedNode?.id === node.id
                    ? 'bg-primary text-black border-primary ring-4 ring-primary/30 z-20'
                    : 'bg-card border-primary/40 text-foreground hover:border-primary'
                }`}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-background border border-primary/30">
                  <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-serif font-bold text-xs">{node.arabicName}</span>
              </motion.button>
            ))}
          </>
        )}
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-background/90 border border-primary/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          dir="rtl"
        >
          <div className="flex items-center gap-4">
            <img src={selectedNode.image} alt="" className="w-16 h-16 rounded-xl object-cover border border-primary/40 shadow-lg" />
            <div>
              <div className="text-xs text-primary font-bold uppercase">{selectedNode.category}</div>
              <h3 className="text-xl font-serif font-bold text-foreground">{selectedNode.arabicName} ({selectedNode.name})</h3>
              <p className="text-xs text-muted-foreground">عقدة حية في شبكة الحكايات الكونية</p>
            </div>
          </div>

          <Link href={`/${selectedNode.type === 'character' ? 'characters' : selectedNode.type === 'world' ? 'worlds' : selectedNode.type === 'comic' ? 'comics' : 'stories'}/${selectedNode.id}`} className="px-6 py-2.5 bg-primary text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all shadow-lg">
            انتقل إلى صفحة العقدة الكاملة
          </Link>
        </motion.div>
      )}
    </div>
  );
}
