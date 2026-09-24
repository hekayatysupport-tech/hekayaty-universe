import React, { useState } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Sparkles,
  Languages
} from "lucide-react";



interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your lore, description, or novel content here (Markdown & Rich formatting supported)...",
  minHeight = "250px",
  label
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("right");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans font-mono">("serif");
  const [fontSize, setFontSize] = useState<"text-base" | "text-lg" | "text-xl">("text-base");

  const insertText = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("rich-text-area") as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = prefix + selected + suffix;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const insertNovelShortcut = (type: "scene_break" | "dialogue" | "thought" | "h1_chapter") => {
    switch (type) {
      case "scene_break":
        insertText("\n\n* * *\n\n", "");
        break;
      case "dialogue":
        insertText('« ', ' »');
        break;
      case "thought":
        insertText('*', '*');
        break;
      case "h1_chapter":
        insertText('# الفصل: ', '');
        break;
    }
  };

  const renderSimpleMarkdown = (text: string) => {
    if (!text) return <span className="text-[#666666] italic">No content written yet. (لم يتم كتابة أي محتوى بعد)</span>;

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-3xl font-serif font-bold text-[#d4af37] mb-4 pb-2 border-b border-[#222228]">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-2xl font-serif font-bold text-[#f0f0f0] mt-6 mb-3">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-xl font-serif font-semibold text-[#c0c0c0] mt-4 mb-2">{line.replace("### ", "")}</h3>;
      }
      if (line === "* * *" || line === "---") {
        return <div key={idx} className="my-6 text-center text-[#d4af37] tracking-[0.5em] font-serif text-lg">✦ ✦ ✦</div>;
      }
      if (line.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-r-4 border-l-0 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 border-[#d4af37] pr-4 pl-2 my-4 bg-[#121216] italic text-[#c8c8c8] py-2 rounded-r">
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={idx} className="ml-6 mr-6 list-disc text-[#e0e0e0] my-1">{line.replace(/^[-*] /, "")}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={idx} className="ml-6 mr-6 list-decimal text-[#e0e0e0] my-1">{line.replace(/^\d+\.\s/, "")}</li>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-3" />;
      }
      return <p key={idx} className="text-[#e0e0e0] leading-relaxed mb-3 text-justify font-serif">{line}</p>;
    });
  };

  const editorContainerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-[#050507] p-6 flex flex-col justify-between overflow-hidden"
    : "border border-[#2a2a2e] rounded-xl overflow-hidden bg-[#0c0c0e] focus-within:border-[#d4af37] transition-all shadow-lg";

  return (
    <div className={`space-y-2 ${isFullscreen ? "h-screen w-screen" : ""}`}>
      {label && !isFullscreen && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            {label}
          </label>
          <span className="text-[10px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded">
            ✨ MS Word Style Prose Editor
          </span>
        </div>
      )}

      <div className={editorContainerClasses}>
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#222226] bg-[#121216] flex-wrap gap-2 shrink-0">
          {/* Main Formatting Group */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Heading controls */}
            <button
              type="button"
              onClick={() => insertText("# ", "")}
              title="Chapter Title / H1"
              className="px-2 py-1 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors text-xs font-bold font-mono"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertText("## ", "")}
              title="Section Header / H2"
              className="px-2 py-1 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors text-xs font-bold font-mono"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertText("### ", "")}
              title="Subheading / H3"
              className="px-2 py-1 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors text-xs font-bold font-mono"
            >
              H3
            </button>

            <div className="w-px h-4 bg-[#2a2a30] mx-1" />

            {/* Bold, Italic */}
            <button
              type="button"
              onClick={() => insertText("**", "**")}
              title="Bold Text (**نص عريض**)"
              className="p-1.5 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("*", "*")}
              title="Italic Text (*نص مائل*)"
              className="p-1.5 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText("> ", "")}
              title="Quote / Dialogue Block"
              className="p-1.5 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-[#2a2a30] mx-1" />

            {/* Novel Quick Action Shortcuts */}
            <button
              type="button"
              onClick={() => insertNovelShortcut("scene_break")}
              title="Insert Scene Break (فاصل المشهد * * *)"
              className="px-2 py-1 hover:bg-[#202026] text-[#d4af37] hover:text-white rounded transition-colors text-xs font-serif font-bold bg-[#d4af37]/10"
            >
              ✦ ✦ ✦
            </button>
            <button
              type="button"
              onClick={() => insertNovelShortcut("dialogue")}
              title="Insert Dialogue Quotes (« حوار »)"
              className="px-2 py-1 hover:bg-[#202026] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors text-xs font-serif font-bold"
            >
              « »
            </button>

            <div className="w-px h-4 bg-[#2a2a30] mx-1" />

            {/* Direction Toggle RTL / LTR */}
            <button
              type="button"
              onClick={() => setDirection((prev) => (prev === "rtl" ? "ltr" : "rtl"))}
              title={`Switch Text Direction (الحالي: ${direction.toUpperCase()})`}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold font-mono transition-colors ${
                direction === "rtl" ? "bg-[#d4af37] text-black" : "bg-[#1f1f26] text-[#e0e0e0]"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              {direction.toUpperCase()}
            </button>

            {/* Alignment Controls */}
            <div className="flex items-center bg-[#18181e] p-0.5 rounded border border-[#2a2a30]">
              <button
                type="button"
                onClick={() => setAlignment("right")}
                title="Align Right (يمين)"
                className={`p-1 rounded ${alignment === "right" ? "bg-[#282832] text-[#d4af37]" : "text-[#888888]"}`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlignment("center")}
                title="Align Center (وسط)"
                className={`p-1 rounded ${alignment === "center" ? "bg-[#282832] text-[#d4af37]" : "text-[#888888]"}`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlignment("left")}
                title="Align Left (يسار)"
                className={`p-1 rounded ${alignment === "left" ? "bg-[#282832] text-[#d4af37]" : "text-[#888888]"}`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlignment("justify")}
                title="Justify Paragraph (ضبط الهوامش)"
                className={`p-1 rounded ${alignment === "justify" ? "bg-[#282832] text-[#d4af37]" : "text-[#888888]"}`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode & Fullscreen Controls */}
          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="bg-[#18181e] border border-[#2a2a30] text-[#d4af37] text-xs font-mono px-2 py-1 rounded focus:outline-none"
            >
              <option value="text-base">Standard Font (عادي)</option>
              <option value="text-lg">Large Font (كبير)</option>
              <option value="text-xl">Word Size (ضخم)</option>
            </select>

            {/* Edit / Preview Switch */}
            <div className="flex items-center gap-1 bg-[#18181e] p-0.5 rounded border border-[#2a2a30]">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  !isPreview ? "bg-[#282832] text-[#d4af37] shadow" : "text-[#888888] hover:text-[#e0e0e0]"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  isPreview ? "bg-[#282832] text-[#d4af37] shadow" : "text-[#888888] hover:text-[#e0e0e0]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen (خروج من ملء الشاشة)" : "Full Page Focus Writing Mode (وضع التركيز ملء الشاشة)"}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1c1c24] hover:bg-[#d4af37] hover:text-black border border-[#33333e] text-xs font-bold text-[#d4af37] rounded transition-all shadow"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  Exit Focus
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  Full Screen Focus
                </>
              )}
            </button>
          </div>
        </div>

        {/* Writing Canvas / MS Word Page Box */}
        <div className={`flex-1 overflow-y-auto ${isFullscreen ? "p-8 max-w-4xl mx-auto w-full" : "p-4"}`}>
          {isPreview ? (
            <div
              dir={direction}
              style={{ minHeight: isFullscreen ? "calc(100vh - 160px)" : minHeight }}
              className={`p-6 sm:p-10 bg-[#070709] border border-[#1a1a20] rounded-xl text-foreground font-serif leading-relaxed shadow-inner overflow-y-auto ${fontSize}`}
            >
              {renderSimpleMarkdown(value)}
            </div>
          ) : (
            <div className="relative">
              <textarea
                id="rich-text-area"
                dir={direction}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  minHeight: isFullscreen ? "calc(100vh - 180px)" : minHeight,
                  textAlign: alignment
                }}
                className={`w-full p-6 sm:p-8 bg-[#070709] text-[#f0f0f0] placeholder:text-[#44444c] font-serif focus:outline-none resize-y rounded-xl border border-[#1a1a22] focus:border-[#d4af37] leading-loose transition-all shadow-inner ${fontSize}`}
              />
            </div>
          )}
        </div>

        {/* Fullscreen Footer Stats */}
        {isFullscreen && (
          <div className="px-6 py-3 border-t border-[#222228] bg-[#0c0c0e] flex items-center justify-between text-xs font-mono text-[#888888] shrink-0">
            <div className="flex items-center gap-6">
              <span>📝 Words: <strong className="text-[#d4af37]">{value.split(/\s+/).filter(Boolean).length}</strong></span>
              <span>🔤 Characters: <strong className="text-white">{value.length}</strong></span>
              <span>⏱️ Reading Time: <strong className="text-white">{Math.max(1, Math.ceil(value.split(/\s+/).filter(Boolean).length / 200))} min</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="text-[#d4af37] hover:underline font-bold"
            >
              Press ESC or Click Here to Exit Full Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

