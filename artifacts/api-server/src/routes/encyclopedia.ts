import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/encyclopedia
 */
router.get("/encyclopedia", async (_req, res) => {
  const { data, error } = await supabase
    .from("encyclopedia_entries")
    .select(`id, title, arabic_title, category, media:cover_media_id ( secure_url )`)
    .order("title");

  if (error) {
    return res.status(500).json({ error: "Internal server error" });
  }

  res.json((data ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    arabicTitle: e.arabic_title,
    category: e.category,
    coverUrl: e.media?.secure_url ?? null,
  })));
});

/**
 * GET /api/encyclopedia/:id
 */
router.get("/encyclopedia/:id", async (req, res) => {
  const { id } = req.params;

  const { data: entry, error } = await supabase
    .from("encyclopedia_entries")
    .select(`id, title, arabic_title, category, content, media:cover_media_id ( secure_url )`)
    .eq("id", id)
    .single();

  if (error || !entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  const { data: tags } = await supabase
    .from("encyclopedia_tags")
    .select("tag")
    .eq("entry_id", id);

  const { data: relatedCharacters } = await supabase
    .from("encyclopedia_characters")
    .select(`characters ( id, name, arabic_name, media:portrait_media_id ( secure_url ) )`)
    .eq("entry_id", id);

  const { data: relatedWorlds } = await supabase
    .from("encyclopedia_worlds")
    .select(`worlds ( id, name, arabic_name )`)
    .eq("entry_id", id);

  const e = entry as any;
  res.json({
    id: e.id,
    title: e.title,
    arabicTitle: e.arabic_title,
    category: e.category,
    content: e.content,
    coverUrl: e.media?.secure_url ?? null,
    tags: (tags ?? []).map((t: any) => t.tag),
    relatedCharacters: (relatedCharacters ?? []).map((c: any) => c.characters).filter(Boolean),
    relatedWorlds: (relatedWorlds ?? []).map((w: any) => w.worlds).filter(Boolean),
  });
});

export default router;
