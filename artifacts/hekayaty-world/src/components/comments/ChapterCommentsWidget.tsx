import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, AlertCircle, Pin, Reply, Send, ShieldAlert, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChapterCommentsWidgetProps {
  storyChapterId?: string;
  novelChapterId?: string;
  comicIssueId?: string;
}

export function ChapterCommentsWidget({ storyChapterId, novelChapterId, comicIssueId }: ChapterCommentsWidgetProps) {
  const [commentsList, setCommentsList] = useState<any[]>([
    {
      id: "comm-1",
      userId: "user-1",
      userName: "Tarek_LoreHunter",
      content: "The revelation about the Veil Portal in line 45 changes everything! Is the High Archon secretly allied with the Shadow Realm?",
      isPinned: true,
      isSpoiler: false,
      likesCount: 42,
      createdAt: "2026-09-18T14:20:00Z",
      replies: [
        {
          id: "rep-1",
          userName: "Ziyad_Reader",
          content: "I think he is! Look back at Chapter 3 when he retrieved the Obsidian Tablet.",
          likesCount: 15,
          createdAt: "2026-09-18T14:45:00Z",
        },
      ],
    },
    {
      id: "comm-2",
      userId: "user-2",
      userName: "Nahr_Fan",
      content: "[SPOILER ALERT] She will definitely awaken her water abilities in the next episode!",
      isPinned: false,
      isSpoiler: true,
      likesCount: 18,
      createdAt: "2026-09-18T16:10:00Z",
      replies: [],
    },
  ]);

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "likes">("newest");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSpoilerComment, setIsSpoilerComment] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!storyChapterId && !novelChapterId && !comicIssueId) return;
    const queryParts = [];
    if (storyChapterId) queryParts.push(`storyChapterId=${storyChapterId}`);
    if (novelChapterId) queryParts.push(`novelChapterId=${novelChapterId}`);
    if (comicIssueId) queryParts.push(`comicIssueId=${comicIssueId}`);
    queryParts.push(`sortBy=${sortBy}`);

    fetch(`/api/comments?${queryParts.join("&")}`)
      .then((res) => res.json())
      .then((fetched) => {
        if (fetched && fetched.comments) {
          setCommentsList(fetched.comments);
        }
      })
      .catch(() => {});
  }, [storyChapterId, novelChapterId, comicIssueId, sortBy]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyChapterId,
          novelChapterId,
          comicIssueId,
          content: newCommentText,
          isSpoiler: isSpoilerComment,
        }),
      });

      if (res.ok) {
        setNewCommentText("");
        setIsSpoilerComment(false);
        // Add optimistically
        setCommentsList((prev) => [
          {
            id: `comm-${Date.now()}`,
            userName: "You",
            content: newCommentText,
            isPinned: false,
            isSpoiler: isSpoilerComment,
            likesCount: 0,
            createdAt: new Date().toISOString(),
            replies: [],
          },
          ...prev,
        ]);
      }
    } catch {}
  };

  const handlePostReply = async (commentId: string) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      setReplyText("");
      setReplyingToId(null);
    } catch {}
  };

  const handleLikeComment = async (id: string) => {
    try {
      await fetch(`/api/comments/${id}/like`, { method: "POST" });
      setCommentsList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likesCount: c.likesCount + 1 } : c))
      );
    } catch {}
  };

  return (
    <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl mt-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-bold text-xl text-foreground">
            Chapter Discussion ({commentsList.length})
          </h3>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="likes">Most Liked</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Post Comment Input */}
      <form onSubmit={handlePostComment} className="space-y-3">
        <div className="relative">
          <textarea
            required
            rows={3}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your theories, reactions, or thoughts about this chapter..."
            className="w-full p-4 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              id="spoilerCheckComment"
              checked={isSpoilerComment}
              onChange={(e) => setIsSpoilerComment(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="spoilerCheckComment" className="cursor-pointer select-none">Contains Chapter Spoilers</label>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-black font-extrabold uppercase text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" /> Post Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6 pt-4">
        {commentsList.map((comm) => {
          const isSpoilerRevealed = revealedSpoilers[comm.id];
          return (
            <div key={comm.id} className={`p-5 rounded-xl border transition-all space-y-3 ${comm.isPinned ? "bg-primary/10 border-primary/40" : "bg-background/40 border-border/60"}`}>
              {comm.isPinned && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Pin className="w-3.5 h-3.5" /> Pinned Official Discussion
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">{comm.userName || "Reader"}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {comm.isSpoiler && !isSpoilerRevealed ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Contains spoiler content</span>
                  <button onClick={() => setRevealedSpoilers({ ...revealedSpoilers, [comm.id]: true })} className="underline font-bold hover:text-white">
                    Show Comment
                  </button>
                </div>
              ) : (
                <p className="text-xs text-foreground/80 leading-relaxed">{comm.content}</p>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border/40">
                <button onClick={() => handleLikeComment(comm.id)} className="flex items-center gap-1 hover:text-primary font-semibold transition-colors">
                  <Heart className="w-3.5 h-3.5" /> {comm.likesCount}
                </button>

                <button onClick={() => setReplyingToId(replyingToId === comm.id ? null : comm.id)} className="flex items-center gap-1 hover:text-primary font-semibold transition-colors">
                  <Reply className="w-3.5 h-3.5" /> Reply
                </button>
              </div>

              {/* Reply Box */}
              {replyingToId === comm.id && (
                <div className="pt-3 pl-4 border-l-2 border-primary/40 space-y-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyingToId(null)} className="px-3 py-1 text-xs text-muted-foreground">Cancel</button>
                    <button onClick={() => handlePostReply(comm.id)} className="px-3 py-1 bg-primary text-black font-bold text-xs rounded-lg">Reply</button>
                  </div>
                </div>
              )}

              {/* Replies List */}
              {comm.replies && comm.replies.length > 0 && (
                <div className="pl-4 pt-2 border-l-2 border-border/60 space-y-3">
                  {comm.replies.map((rep: any) => (
                    <div key={rep.id} className="p-3 rounded-lg bg-background/60 border border-border/40 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-foreground">{rep.userName || "Reader"}</span>
                        <span className="text-muted-foreground">{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-foreground/80">{rep.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
