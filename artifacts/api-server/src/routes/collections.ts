import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { readingLists, readingListItems, originals, novelsTable, comicSeries } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
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
 * GET /api/collections
 * Get public reading lists and user collections
 */
router.get("/collections", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, visibility = "public" } = req.query;

    const conditions = [];
    if (userId) {
      conditions.push(eq(readingLists.userId, String(userId)));
    } else {
      conditions.push(eq(readingLists.visibility, "public"));
    }

    const lists = await db
      .select()
      .from(readingLists)
      .where(and(...conditions))
      .orderBy(desc(readingLists.isFeatured), desc(readingLists.createdAt));

    res.json({ collections: lists });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch collections" });
  }
});

/**
 * POST /api/collections
 * Create a new custom reading list
 */
router.post("/collections", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, arabicTitle, description, visibility = "public" } = req.body;

    if (!title) {
      res.status(400).json({ error: "Collection title is required" });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const [newList] = await db
      .insert(readingLists)
      .values({
        userId: user.id,
        title: title.trim(),
        arabicTitle: arabicTitle ? arabicTitle.trim() : title.trim(),
        slug,
        description,
        visibility,
      })
      .returning();

    res.status(201).json({ collection: newList });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create collection" });
  }
});

/**
 * POST /api/collections/:id/items
 * Add an item (story/novel/comic) to a collection
 */
router.post("/collections/:id/items", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const listId = req.params.id as string;
    const { originalId, novelId, comicId } = req.body;

    const [item] = await db
      .insert(readingListItems)
      .values({
        listId,
        originalId: originalId || null,
        novelId: novelId || null,
        comicId: comicId || null,
      })
      .returning();

    res.status(201).json({ item });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to add item to collection" });
  }
});

export default router;
