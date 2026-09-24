import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/news
 */
router.get("/news", async (_req, res) => {
  const { data, error } = await supabase
    .from("news")
    .select(`id, title, arabic_title, slug, category, excerpt, published_at, media:cover_media_id ( secure_url )`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching news:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }

  res.json((data ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    arabicTitle: n.arabic_title,
    slug: n.slug,
    category: n.category,
    excerpt: n.excerpt,
    publishedAt: n.published_at,
    coverUrl: n.media?.secure_url ?? null,
  })));
});

/**
 * GET /api/news/:id
 */
router.get("/news/:id", async (req, res) => {
  const { id } = req.params;

  const { data: article, error } = await supabase
    .from("news")
    .select(`id, title, arabic_title, slug, category, content, excerpt, published_at, media:cover_media_id ( secure_url )`)
    .eq("id", id)
    .single();

  if (error || !article) {
    return res.status(404).json({ error: "Article not found" });
  }

  const { data: tags } = await supabase
    .from("news_tags")
    .select("tag")
    .eq("news_id", id);

  const n = article as any;
  res.json({
    id: n.id,
    title: n.title,
    arabicTitle: n.arabic_title,
    slug: n.slug,
    category: n.category,
    content: n.content,
    excerpt: n.excerpt,
    publishedAt: n.published_at,
    coverUrl: n.media?.secure_url ?? null,
    tags: (tags ?? []).map((t: any) => t.tag),
  });
});

export default router;
