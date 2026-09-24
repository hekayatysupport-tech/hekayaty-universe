import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { mutationRateLimiter, publicReadRateLimiter } from "../middleware/rateLimiter";
import { sanitizeHtml, sanitizeText } from "../lib/sanitizer";

const router = Router();

/**
 * GET /api/comments
 */
router.get("/comments", publicReadRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { storyChapterId, novelChapterId, comicIssueId, sortBy = "newest" } = req.query;

    let query = supabase
      .from("comments")
      .select("*")
      .eq("is_hidden", false);

    if (storyChapterId) query = query.eq("story_chapter_id", String(storyChapterId));
    if (novelChapterId) query = query.eq("novel_chapter_id", String(novelChapterId));
    if (comicIssueId) query = query.eq("comic_issue_id", String(comicIssueId));

    if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortBy === "likes") {
      query = query.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: commentList, error } = await query;

    if (error) {
      console.warn("GET /api/comments warning:", error.message);
      res.json({ comments: [] });
      return;
    }

    const list = commentList || [];

    // Fetch replies for each comment
    const enriched = await Promise.all(
      list.map(async (c: any) => {
        const { data: replies } = await supabase
          .from("comment_replies")
          .select("*")
          .eq("comment_id", c.id)
          .eq("is_hidden", false)
          .order("created_at", { ascending: true })
          .limit(10);

        return {
          id: c.id,
          userId: c.user_id,
          userName: c.user_name || "قارئ حكاياتي",
          content: c.content,
          isSpoiler: c.is_spoiler,
          isPinned: c.is_pinned,
          likesCount: c.likes_count || 0,
          repliesCount: c.replies_count || 0,
          createdAt: c.created_at,
          replies: (replies || []).map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name || "قارئ",
            content: r.content,
            isSpoiler: r.is_spoiler,
            likesCount: r.likes_count || 0,
            createdAt: r.created_at,
          })),
        };
      })
    );

    res.json({ comments: enriched });
  } catch (error: any) {
    console.error("GET /api/comments error:", error.message);
    res.json({ comments: [] });
  }
});

/**
 * POST /api/comments
 */
router.post("/comments", requireAuth, mutationRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { storyChapterId, novelChapterId, comicIssueId, content, isSpoiler } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Comment content is required" });
      return;
    }

    // Sanitize comment HTML / text to prevent Stored XSS
    const sanitizedContent = sanitizeHtml(content.trim());

    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        story_chapter_id: storyChapterId ? String(storyChapterId) : null,
        novel_chapter_id: novelChapterId ? String(novelChapterId) : null,
        comic_issue_id: comicIssueId ? String(comicIssueId) : null,
        content: sanitizedContent,
        is_spoiler: Boolean(isSpoiler),
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: "Failed to post comment" });
      return;
    }

    res.status(201).json({ comment: newComment });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to post comment" });
  }
});

/**
 * POST /api/comments/:id/reply
 */
router.post("/comments/:id/reply", requireAuth, mutationRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id: commentId } = req.params;
    const { content, isSpoiler } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Reply content is required" });
      return;
    }

    const sanitizedContent = sanitizeHtml(content.trim());

    const { data: reply, error } = await supabase
      .from("comment_replies")
      .insert({
        comment_id: String(commentId),
        user_id: user.id,
        content: sanitizedContent,
        is_spoiler: Boolean(isSpoiler),
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: "Failed to post reply" });
      return;
    }

    // Increment replies count safely
    const { data: current } = await supabase.from("comments").select("replies_count").eq("id", commentId).single();
    if (current) {
      await supabase.from("comments").update({ replies_count: (current.replies_count || 0) + 1 }).eq("id", commentId);
    }

    res.status(201).json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to post reply" });
  }
});

/**
 * POST /api/comments/:id/like
 */
router.post("/comments/:id/like", requireAuth, mutationRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id: commentId } = req.params;

    // Check existing like
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("comment_id", commentId)
      .maybeSingle();

    const { data: current } = await supabase.from("comments").select("likes_count").eq("id", commentId).single();
    const currentCount = current?.likes_count || 0;

    if (existing) {
      await supabase.from("comment_likes").delete().eq("id", existing.id);
      await supabase.from("comments").update({ likes_count: Math.max(0, currentCount - 1) }).eq("id", commentId);
      res.json({ liked: false });
    } else {
      await supabase.from("comment_likes").insert({ user_id: user.id, comment_id: commentId });
      await supabase.from("comments").update({ likes_count: currentCount + 1 }).eq("id", commentId);
      res.json({ liked: true });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

/**
 * POST /api/comments/:id/report
 */
router.post("/comments/:id/report", requireAuth, mutationRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id: commentId } = req.params;
    const { reason } = req.body;

    const sanitizedReason = sanitizeText(reason || "Inappropriate content");

    const { data: report, error } = await supabase
      .from("comment_reports")
      .insert({
        reporter_id: user.id,
        comment_id: String(commentId),
        reason: sanitizedReason,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: "Failed to submit report" });
      return;
    }

    res.json({ success: true, reportId: report.id });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

export default router;

