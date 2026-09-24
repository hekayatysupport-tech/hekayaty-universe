import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /api/library
 * Fetch user's library items & reading progress
 * Uses item_id (text) to support non-UUID novel/comic IDs
 */
router.get("/library", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;

    // Fetch library entries
    const { data: libRows, error: libErr } = await supabase
      .from("user_library")
      .select("id, item_id, original_id, item_type, is_favorite, added_at")
      .eq("user_id", user.id);

    // Fetch reading progress (with original_id UUID join if available)
    const { data: progressRows } = await supabase
      .from("user_reading_progress")
      .select(`
        id, progress_percentage, last_page_number, updated_at,
        chapter:story_chapter_id ( id, chapter_number, title, arabic_title )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (libErr) {
      console.error("Library fetch error:", libErr.message);
    }

    // For each library item, fetch the novel or comic details
    const rawItems = await Promise.all(
      (libRows || []).map(async (item: any) => {
        let originalData: any = null;
        const targetId = item.item_id || item.original_id;

        if (!targetId) return null;

        try {
          if (item.item_type === "comic") {
            // Fetch from comic_series
            const { data: comic } = await supabase
              .from("comic_series")
              .select("id, title, arabic_title, description, media:cover_media_id ( secure_url )")
              .eq("id", targetId)
              .maybeSingle();

            if (comic) {
              originalData = {
                id: comic.id,
                title: comic.title,
                arabicTitle: (comic as any).arabic_title || comic.title,
                slug: null,
                contentType: "comic",
                accessLevel: "subscriber",
                coverUrl: (comic as any).media?.secure_url || null,
              };
            }
          } else {
            // Fetch from novels table (by id or slug)
            const { data: novel } = await supabase
              .from("novels")
              .select("id, title, arabic_title, slug, cover_url, is_premium")
              .or(`id.eq.${targetId},slug.eq.${targetId}`)
              .maybeSingle();

            if (novel) {
              originalData = {
                id: novel.id,
                title: novel.title,
                arabicTitle: (novel as any).arabic_title || novel.title,
                slug: novel.slug,
                contentType: "novel",
                accessLevel: (novel as any).is_premium ? "subscriber" : "public",
                coverUrl: (novel as any).cover_url || null,
              };
            }
          }
        } catch (e: any) {
          console.error("Error fetching item details:", e.message);
        }

        return {
          id: item.id,
          itemId: targetId,
          itemType: item.item_type || "novel",
          isFavorite: item.is_favorite,
          addedAt: item.added_at,
          original: originalData,
        };
      })
    );

    const libraryItems = rawItems.filter(Boolean);

    res.json({
      library: libraryItems,
      readingProgress: (progressRows || []).map((p: any) => ({
        id: p.id,
        progressPercentage: p.progress_percentage,
        lastPageNumber: p.last_page_number,
        updatedAt: p.updated_at,
        chapter: p.chapter
          ? {
              id: p.chapter.id,
              chapterNumber: p.chapter.chapter_number,
              title: p.chapter.title,
              arabicTitle: p.chapter.arabic_title,
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching user library:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/library
 * Add/toggle item in user library using item_id (text) + item_type
 */
router.post("/library", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const { originalId, itemId, itemType, isFavorite } = req.body;

    // Support both new (itemId) and legacy (originalId) formats
    const resolvedItemId = itemId || originalId;
    const resolvedItemType = itemType || "novel";

    if (!resolvedItemId) {
      res.status(400).json({ error: "item_id is required" });
      return;
    }

    // Check if user library table already has this item (by item_id or original_id)
    const { data: existingRows } = await supabase
      .from("user_library")
      .select("id, item_id, original_id")
      .eq("user_id", user.id);

    const existing = (existingRows || []).find(
      (item: any) =>
        item.item_id === resolvedItemId ||
        item.original_id === resolvedItemId
    );

    if (existing) {
      await supabase.from("user_library").delete().eq("id", existing.id);
      res.json({ added: false, message: "Removed from library" });
      return;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedItemId);

    const insertPayload: any = {
      user_id: user.id,
      item_id: resolvedItemId,
      item_type: resolvedItemType,
      is_favorite: isFavorite ?? false,
    };
    if (isUuid) {
      insertPayload.original_id = resolvedItemId;
    }

    let { data, error } = await supabase
      .from("user_library")
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if item_id column is missing or schema constraint fails
    if (error) {
      console.warn("Retrying user_library insert with fallback:", error.message);
      const fallbackPayload: any = {
        user_id: user.id,
        is_favorite: isFavorite ?? false,
      };
      if (isUuid) fallbackPayload.original_id = resolvedItemId;
      const retry = await supabase.from("user_library").insert(fallbackPayload).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    res.status(201).json({ added: true, item: data });
  } catch (error: any) {
    console.error("Error updating library:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/progress
 * Save reading progress
 */
router.post("/progress", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const {
      originalId,
      storyChapterId,
      comicIssueId,
      progressPercentage,
      lastPageNumber,
    } = req.body;

    const { data, error } = await supabase
      .from("user_reading_progress")
      .upsert({
        user_id: user.id,
        original_id: originalId || null,
        story_chapter_id: storyChapterId || null,
        comic_issue_id: comicIssueId || null,
        progress_percentage: progressPercentage ?? 0,
        last_page_number: lastPageNumber ?? 1,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, progress: data });
  } catch (error: any) {
    console.error("Error saving progress:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
