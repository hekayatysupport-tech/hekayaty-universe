import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

async function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  return user || null;
}

/**
 * GET /api/reviews
 */
router.get("/reviews", async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalId, novelId } = req.query;

    let query = supabase
      .from("reviews")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("helpful_votes", { ascending: false })
      .order("created_at", { ascending: false });

    if (originalId) query = query.eq("original_id", String(originalId));
    if (novelId) query = query.eq("novel_id", String(novelId));

    const { data: reviewList, error } = await query;

    if (error) {
      // Table may not exist yet — return empty gracefully
      console.warn("GET /api/reviews warning:", error.message);
      res.json({ averageRating: "0.0", totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, reviews: [] });
      return;
    }

    const list = reviewList || [];
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    list.forEach((r: any) => {
      const stars = Math.min(5, Math.max(1, r.rating_stars));
      distribution[stars] = (distribution[stars] || 0) + 1;
      totalScore += stars;
    });

    const totalReviews = list.length;
    const averageRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : "0.0";

    res.json({
      averageRating,
      totalReviews,
      distribution,
      reviews: list.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        originalId: r.original_id,
        novelId: r.novel_id,
        ratingStars: r.rating_stars,
        title: r.title,
        body: r.body,
        isSpoiler: r.is_spoiler,
        isVerifiedSubscriber: r.is_verified_subscriber,
        isFeatured: r.is_featured,
        helpfulVotes: r.helpful_votes,
        createdAt: r.created_at,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error.message);
    res.json({ averageRating: "0.0", totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, reviews: [] });
  }
});

/**
 * POST /api/reviews
 */
router.post("/reviews", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getAuthUser(req);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { originalId, novelId, ratingStars, title, body, isSpoiler } = req.body;

    if (!ratingStars || ratingStars < 1 || ratingStars > 5) {
      res.status(400).json({ error: "Rating stars must be between 1 and 5" }); return;
    }
    if (!title || !body) {
      res.status(400).json({ error: "Review title and body are required" }); return;
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        original_id: originalId || null,
        novel_id: novelId || null,
        rating_stars: Number(ratingStars),
        title: title.trim(),
        body: body.trim(),
        is_spoiler: Boolean(isSpoiler),
        is_verified_subscriber: true,
      })
      .select()
      .single();

    if (error) { res.status(500).json({ error: error.message }); return; }
    res.status(201).json({ review });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to submit review" });
  }
});

/**
 * POST /api/reviews/:id/vote
 */
router.post("/reviews/:id/vote", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getAuthUser(req);
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { id } = req.params;
    const { data: current } = await supabase.from("reviews").select("helpful_votes").eq("id", id).single();
    if (current) {
      await supabase.from("reviews").update({ helpful_votes: (current.helpful_votes || 0) + 1 }).eq("id", id);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to vote review" });
  }
});

export default router;
