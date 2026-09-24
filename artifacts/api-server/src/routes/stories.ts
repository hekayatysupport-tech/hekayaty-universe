import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/stories
 * List all story series
 */
router.get("/stories", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id, title, arabic_title, synopsis, author_name, created_at,
        cover_media:cover_media_id ( secure_url ),
        original:original_id ( slug, access_level )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json((data || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      arabicTitle: s.arabic_title,
      synopsis: s.synopsis,
      authorName: s.author_name,
      coverUrl: s.cover_media?.secure_url || null,
      originalSlug: s.original?.slug || null,
      accessLevel: s.original?.access_level || "public",
    })));
  } catch (error: any) {
    console.error("Error fetching stories:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/stories/:storyId/chapters
 * List chapters for a story series
 */
router.get("/stories/:storyId/chapters", async (req, res) => {
  try {
    const { storyId } = req.params;

    const { data, error } = await supabase
      .from("story_chapters")
      .select("id, chapter_number, title, arabic_title, read_time_minutes, access_level, status, published_at")
      .eq("story_id", storyId)
      .eq("status", "published")
      .order("sort_order");

    if (error) throw error;

    res.json((data || []).map((c: any) => ({
      id: c.id,
      chapterNumber: c.chapter_number,
      title: c.title,
      arabicTitle: c.arabic_title,
      readTimeMinutes: c.read_time_minutes,
      accessLevel: c.access_level,
      publishedAt: c.published_at,
    })));
  } catch (error: any) {
    console.error("Error fetching story chapters:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/stories/chapters/:chapterId
 * Get chapter content. If chapter access is 'subscriber', validates token & subscription status.
 */
router.get("/stories/chapters/:chapterId", async (req, res) => {
  try {
    const { chapterId } = req.params;

    const { data: chapter, error } = await supabase
      .from("story_chapters")
      .select("*, story:story_id ( id, title, arabic_title )")
      .eq("id", chapterId)
      .single();

    if (error || !chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Check if chapter requires subscription
    if (chapter.access_level === "subscriber") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Sign in to access this premium Hekayaty Originals chapter.",
          isLocked: true,
        });
      }

      const token = authHeader.split(" ")[1];
      const { data: authData } = await supabase.auth.getUser(token);
      if (!authData?.user) {
        return res.status(401).json({ error: "Invalid session" });
      }

      // Check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", authData.user.id)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!sub) {
        return res.status(403).json({
          error: "Subscription Required",
          message: "This chapter is exclusive to Hekayaty Originals subscribers.",
          isLocked: true,
          plans: [
            { type: "monthly", price: 59, currency: "EGP" },
            { type: "quarterly", price: 139, currency: "EGP" },
            { type: "yearly", price: 499, currency: "EGP", badge: "Best Value" },
          ],
        });
      }
    }

    res.json({
      id: chapter.id,
      storyId: chapter.story_id,
      storyTitle: chapter.story?.title,
      storyArabicTitle: chapter.story?.arabic_title,
      chapterNumber: chapter.chapter_number,
      title: chapter.title,
      arabicTitle: chapter.arabic_title,
      content: chapter.content,
      arabicContent: chapter.arabic_content,
      readTimeMinutes: chapter.read_time_minutes,
      accessLevel: chapter.access_level,
      isLocked: false,
    });
  } catch (error: any) {
    console.error("Error reading chapter:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
