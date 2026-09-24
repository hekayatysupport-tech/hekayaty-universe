import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/universe/graph", async (_req: Request, res: Response) => {
  try {
    const [
      { data: chars },
      { data: worlds },
      { data: stories },
      { data: comics },
      { data: events },
      { data: relations }
    ] = await Promise.all([
      supabase.from("characters").select("id, name, arabic_name, power_category, media:portrait_media_id ( secure_url )"),
      supabase.from("worlds").select("id, name, arabic_name, media:cover_media_id ( secure_url )"),
      supabase.from("stories").select("id, title, arabic_title, media:cover_media_id ( secure_url )"),
      supabase.from("comic_series").select("id, title, arabic_title, media:cover_media_id ( secure_url )"),
      supabase.from("timeline_events").select("id, title, arabic_title, media:media_id ( secure_url )"),
      supabase.from("entity_relations").select("*")
    ]);

    const nodes: any[] = [];

    (chars || []).forEach((c: any) => {
      nodes.push({
        id: c.id,
        type: "character",
        name: c.name,
        arabicName: c.arabic_name || c.name,
        category: c.power_category || "Character",
        image: c.media?.secure_url || "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/characters/tarek_portrait.jpg",
      });
    });

    (worlds || []).forEach((w: any) => {
      nodes.push({
        id: w.id,
        type: "world",
        name: w.name,
        arabicName: w.arabic_name || w.name,
        category: "World",
        image: w.media?.secure_url || "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/egypt_cover.jpg",
      });
    });

    (stories || []).forEach((s: any) => {
      nodes.push({
        id: s.id,
        type: "story",
        name: s.title,
        arabicName: s.arabic_title || s.title,
        category: "Story",
        image: s.media?.secure_url || "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/crossers_vol1_cover.jpg",
      });
    });

    (comics || []).forEach((cm: any) => {
      nodes.push({
        id: cm.id,
        type: "comic",
        name: cm.title,
        arabicName: cm.arabic_title || cm.title,
        category: "Comic Series",
        image: cm.media?.secure_url || "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/crossers_vol1_cover.jpg",
      });
    });

    (events || []).forEach((e: any) => {
      nodes.push({
        id: e.id,
        type: "event",
        name: e.title,
        arabicName: e.arabic_title || e.title,
        category: "Timeline Event",
        image: e.media?.secure_url || "https://res.cloudinary.com/demo/image/upload/v1/hekayaty/worlds/egypt_cover.jpg",
      });
    });

    const links = (relations || []).map((r: any) => ({
      source: r.source_id,
      target: r.target_id,
      label: r.relation_type || "Connected",
    }));

    res.json({ nodes, links });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch universe graph" });
  }
});

router.get("/universe/node/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data: relations } = await supabase
      .from("entity_relations")
      .select("*")
      .or(`source_id.eq.${id},target_id.eq.${id}`);

    const relatedIds = new Set<string>();
    (relations || []).forEach((r: any) => {
      if (r.source_id === id) relatedIds.add(r.target_id);
      if (r.target_id === id) relatedIds.add(r.source_id);
    });

    // Fetch primary node from characters, worlds, or stories
    let node: any = null;
    const { data: char } = await supabase.from("characters").select("id, name, arabic_name, power_category").eq("id", id).single();
    if (char) {
      node = { id: char.id, type: "character", name: char.name, arabicName: char.arabic_name, category: char.power_category || "Character" };
    } else {
      const { data: w } = await supabase.from("worlds").select("id, name, arabic_name").eq("id", id).single();
      if (w) {
        node = { id: w.id, type: "world", name: w.name, arabicName: w.arabic_name, category: "World" };
      }
    }

    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    res.json({
      node,
      relatedNodes: Array.from(relatedIds).map(rid => ({ id: rid })),
      links: (relations || []).map((r: any) => ({ source: r.source_id, target: r.target_id, label: r.relation_type })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch node" });
  }
});

export default router;
