import React, { useState, useEffect } from "react";
import { Bold, Italic, Heading1, Heading2, Quote, Image as ImageIcon, Table, Eye, Save, Sparkles, Layers, Globe, Swords, BookOpen, Check } from "lucide-react";

interface NotionEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

export function NotionEditor({ initialContent = "", onChange, onSave }: NotionEditorProps) {
  const [content, setContent] = useState(
    initialContent ||
    `# Chapter 1: The Gathering at the Veil\n\nThe desert wind swept through the ancient stone pillars of Karnak. Saqr stood silently atop the ruins, gazing toward the shimmering horizon.\n\n> "The seal is breaking. We must summon the Council before sunset."\n\n![Karnak Citadel](https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/egypt_cover.jpg)\n\n---\n\n## Lore Connection\nAncient artifacts resonate with solar magic when activated during the Solstice.`
  );

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleTextChange = (val: string) => {
    setContent(val);
    if (onChange) onChange(val);
  };

  const insertSnippet = (prefix: string, suffix = "") => {
    setContent((prev) => `${prev}\n${prefix}${suffix}`);
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xl space-y-0">
      {/* Editor Toolbar */}
      <div className="bg-muted/80 backdrop-blur-md px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
        {/* Formatting Buttons */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => insertSnippet("### ", "")} title="Heading" className="p-2 rounded-lg hover:bg-background text-foreground/80 hover:text-primary transition-colors">
            <Heading1 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertSnippet("#### ", "")} title="Subheading" className="p-2 rounded-lg hover:bg-background text-foreground/80 hover:text-primary transition-colors">
            <Heading2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertSnippet("**", "**")} title="Bold" className="p-2 rounded-lg hover:bg-background text-foreground/80 hover:text-primary transition-colors">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertSnippet("*", "*")} title="Italic" className="p-2 rounded-lg hover:bg-background text-foreground/80 hover:text-primary transition-colors">
            <Italic className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertSnippet("> ", "")} title="Blockquote" className="p-2 rounded-lg hover:bg-background text-foreground/80 hover:text-primary transition-colors">
            <Quote className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertSnippet("\n---\n")} title="Divider" className="p-2 rounded-lg hover:bg-background text-foreground/80 hover:text-primary transition-colors font-bold text-xs">
            —
          </button>
          <span className="h-4 w-px bg-border mx-1" />
          {/* Lore Embed Snippets */}
          <button type="button" onClick={() => insertSnippet("[Character: Saqr]")} title="Embed Character Reference" className="p-2 rounded-lg hover:bg-background text-amber-400 transition-colors flex items-center gap-1 text-xs font-bold">
            <Swords className="w-3.5 h-3.5" /> Character
          </button>
          <button type="button" onClick={() => insertSnippet("[World: Ancient Egypt]")} title="Embed World Reference" className="p-2 rounded-lg hover:bg-background text-cyan-400 transition-colors flex items-center gap-1 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" /> World
          </button>
        </div>

        {/* View Mode & Save Actions */}
        <div className="flex items-center gap-3">
          {autoSavedTime && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Auto-saved at {autoSavedTime}
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              isPreviewMode ? "bg-primary text-black" : "bg-background text-foreground hover:bg-secondary"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> {isPreviewMode ? "Editing Mode" : "Live Preview"}
          </button>

          <button
            type="button"
            onClick={() => onSave && onSave(content)}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-primary text-black font-extrabold text-xs uppercase tracking-wider rounded-lg shadow hover:brightness-110 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Chapter
          </button>
        </div>
      </div>

      {/* Main Editing Area / Live Preview */}
      <div className="p-6 min-h-[400px]">
        {isPreviewMode ? (
          <div className="prose prose-invert max-w-none space-y-4 font-serif text-foreground leading-relaxed text-sm md:text-base">
            {content.split("\n").map((line, idx) => {
              if (line.startsWith("# ")) {
                return <h1 key={idx} className="text-3xl font-extrabold text-primary border-b border-border pb-2">{line.replace("# ", "")}</h1>;
              }
              if (line.startsWith("## ")) {
                return <h2 key={idx} className="text-xl font-bold text-amber-300">{line.replace("## ", "")}</h2>;
              }
              if (line.startsWith("> ")) {
                return (
                  <blockquote key={idx} className="p-4 border-l-4 border-primary bg-primary/10 italic text-amber-200 rounded-r-lg">
                    {line.replace("> ", "")}
                  </blockquote>
                );
              }
              if (line.startsWith("![")) {
                const match = line.match(/\((.*?)\)/);
                if (match) {
                  return <img key={idx} src={match[1]} alt="Embed Illustration" className="w-full max-h-96 object-cover rounded-xl border border-border" />;
                }
              }
              if (line === "---") {
                return <hr key={idx} className="border-border my-6" />;
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full h-96 bg-transparent text-foreground font-mono text-xs md:text-sm focus:outline-none leading-relaxed resize-y"
            placeholder="Write your story chapter here using Markdown or formatting snippets..."
          />
        )}
      </div>
    </div>
  );
}
