import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/search?q=query
 * Real global database search across Characters, Worlds, Comics, Originals, Stories, Encyclopedia, and News.
 */
router.get("/search", async (req, res): Promise<void> => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query || query.length < 2) {
      res.json({ results: [] });
      return;
    }

    const pattern = `%${query}%`;

    const [charsRes, worldsRes, comicsRes, originalsRes, storiesRes, encylRes, newsRes] = await Promise.all([
      supabase.from("characters").select("id, name, arabic_name, alias, media:portrait_media_id ( secure_url )").or(`name.ilike.${pattern},arabic_name.ilike.${pattern},alias.ilike.${pattern}`).limit(5),
      supabase.from("worlds").select("id, name, arabic_name, description, media:cover_media_id ( secure_url )").or(`name.ilike.${pattern},arabic_name.ilike.${pattern}`).limit(5),
      supabase.from("comic_series").select("id, title, arabic_title, media:cover_media_id ( secure_url )").or(`title.ilike.${pattern},arabic_title.ilike.${pattern}`).limit(5),
      supabase.from("originals").select("id, title, arabic_title, slug, content_type, media:cover_media_id ( secure_url )").or(`title.ilike.${pattern},arabic_title.ilike.${pattern}`).limit(5),
      supabase.from("stories").select("id, title, arabic_title, media:cover_media_id ( secure_url )").or(`title.ilike.${pattern},arabic_title.ilike.${pattern}`).limit(5),
      supabase.from("encyclopedia_entries").select("id, title, arabic_title, category").or(`title.ilike.${pattern},arabic_title.ilike.${pattern}`).limit(5),
      supabase.from("news").select("id, title, arabic_title, slug").or(`title.ilike.${pattern},arabic_title.ilike.${pattern}`).limit(5),
    ]);

    const results = [
      ...(charsRes.data || []).map((c: any) => ({ type: "character", id: c.id, title: c.arabic_name || c.name, subtitle: c.alias || c.name, url: `/characters/${c.id}`, imageUrl: c.media?.secure_url })),
      ...(worldsRes.data || []).map((w: any) => ({ type: "world", id: w.id, title: w.arabic_name || w.name, subtitle: w.description, url: `/worlds/${w.id}`, imageUrl: w.media?.secure_url })),
      ...(comicsRes.data || []).map((cm: any) => ({ type: "comic", id: cm.id, title: cm.arabic_title || cm.title, subtitle: "Comic Series", url: `/comics/${cm.id}`, imageUrl: cm.media?.secure_url })),
      ...(originalsRes.data || []).map((o: any) => ({ type: "original", id: o.id, title: o.arabic_title || o.title, subtitle: `Hekayaty Original (${o.content_type})`, url: `/originals/${o.slug}`, imageUrl: o.media?.secure_url })),
      ...(storiesRes.data || []).map((s: any) => ({ type: "story", id: s.id, title: s.arabic_title || s.title, subtitle: "Original Story", url: `/stories`, imageUrl: s.media?.secure_url })),
      ...(encylRes.data || []).map((e: any) => ({ type: "encyclopedia", id: e.id, title: e.arabic_title || e.title, subtitle: `Lore ${e.category}`, url: `/encyclopedia/${e.id}` })),
      ...(newsRes.data || []).map((n: any) => ({ type: "news", id: n.id, title: n.arabic_title || n.title, subtitle: "News Dispatch", url: `/news/${n.slug || n.id}` })),
    ];

    res.json({ results });
  } catch (error: any) {
    console.error("Search API Error:", error.message);
    res.status(500).json({ error: "Internal server error during search" });
  }
});

export default router;
