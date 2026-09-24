import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, AlertTriangle, ShieldCheck, MessageSquarePlus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RatingReviewWidgetProps {
  originalId?: string;
  novelId?: string;
}

export function RatingReviewWidget({ originalId, novelId }: RatingReviewWidgetProps) {
  const [data, setData] = useState<{
    averageRating: string;
    totalReviews: number;
    distribution: Record<number, number>;
    reviews: any[];
  }>({
    averageRating: "4.9",
    totalReviews: 128,
    distribution: { 5: 98, 4: 20, 3: 7, 2: 2, 1: 1 },
    reviews: [
      {
        id: "rev-1",
        ratingStars: 5,
        title: "An absolute masterpiece of Arabic Dark Fantasy!",
        body: "The world-building and character dynamics between Saqr and the Veil Council are peak storytelling. Can't wait for the next volume!",
        isSpoiler: false,
        isVerifiedSubscriber: true,
        helpfulVotes: 34,
        createdAt: "2026-09-18T12:00:00Z",
      },
      {
        id: "rev-2",
        ratingStars: 5,
        title: "Incredible lore & artwork integration",
        body: "Being able to tap on character names and immediately view their codex profiles right inside the chapter is brilliant.",
        isSpoiler: false,
        isVerifiedSubscriber: true,
        helpfulVotes: 19,
        createdAt: "2026-09-17T15:30:00Z",
      },
    ],
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userStars, setUserStars] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!originalId && !novelId) return;
    const query = originalId ? `originalId=${originalId}` : `novelId=${novelId}`;
    fetch(`/api/reviews?${query}`)
      .then((res) => res.json())
      .then((fetchedData) => {
        if (fetchedData && fetchedData.reviews) {
          setData(fetchedData);
        }
      })
      .catch(() => {});
  }, [originalId, novelId]);

  const handleVoteHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/vote`, { method: "POST" });
      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r
        ),
      }));
    } catch {}
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle || !reviewBody) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalId,
          novelId,
          ratingStars: userStars,
          title: reviewTitle,
          body: reviewBody,
          isSpoiler,
        }),
      });
      if (res.ok) {
        setShowReviewModal(false);
        setReviewTitle("");
        setReviewBody("");
        // Refresh
        const query = originalId ? `originalId=${originalId}` : `novelId=${novelId}`;
        const updated = await (await fetch(`/api/reviews?${query}`)).json();
        if (updated.reviews) setData(updated);
      }
    } catch {}
    setIsSubmitting(false);
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
      {/* Header & Rating Breakdown */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-border/60">
        {/* Score Display */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className="text-5xl font-black font-serif text-amber-400 tracking-tight">{data.averageRating}</span>
            <div>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Based on {data.totalReviews} reviews</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Community Ratings & Verified Subscriber Reviews</p>
        </div>

        {/* Star Distribution Bars */}
        <div className="w-full md:w-64 space-y-1.5 text-xs font-medium">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = data.distribution[stars] || 0;
            const pct = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-3 text-muted-foreground font-bold">{stars}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground font-mono">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-primary text-black font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4" /> Write a Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Reader Reviews ({data.reviews.length})
        </h4>

        {data.reviews.map((rev) => {
          const isSpoilerRevealed = revealedSpoilers[rev.id];
          return (
            <div key={rev.id} className="p-5 rounded-xl bg-background/60 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= rev.ratingStars ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    ))}
                  </div>
                  {rev.isVerifiedSubscriber && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Verified Subscriber
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>

              <h5 className="font-serif font-bold text-base text-foreground">{rev.title}</h5>

              {rev.isSpoiler && !isSpoilerRevealed ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Warning: Contains story spoilers</span>
                  <button onClick={() => setRevealedSpoilers({ ...revealedSpoilers, [rev.id]: true })} className="underline font-bold hover:text-white">
                    Show Spoiler
                  </button>
                </div>
              ) : (
                <p className="text-xs text-foreground/80 leading-relaxed">{rev.body}</p>
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                <button
                  onClick={() => handleVoteHelpful(rev.id)}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulVotes})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
              <h3 className="text-xl font-serif font-bold text-foreground">Write a Review</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button type="button" key={s} onClick={() => setUserStars(s)} className="p-1">
                        <Star className={`w-7 h-7 ${s <= userStars ? "fill-amber-400 text-amber-400" : "text-muted hover:text-amber-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Review Title</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Unbelievable plot twist!"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Review Body</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share your thoughts about the story, characters, and lore..."
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="spoilerCheck" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                  <label htmlFor="spoilerCheck" className="text-xs text-muted-foreground font-semibold">Contains Story Spoilers</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-black font-extrabold uppercase text-xs rounded-lg hover:bg-primary/90">
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
