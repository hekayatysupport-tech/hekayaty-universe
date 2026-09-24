import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { contentSchedules, originals, storyChapters, comicIssues } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

/**
 * GET /api/admin/schedules
 * Fetch release calendar items
 */
router.get("/schedules", async (req: Request, res: Response): Promise<void> => {
  try {
    const schedules = await db
      .select()
      .from(contentSchedules)
      .orderBy(desc(contentSchedules.scheduledFor));

    res.json({ schedules });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch schedules" });
  }
});

/**
 * POST /api/admin/schedules
 * Schedule a release
 */
router.post("/schedules", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      originalId,
      storyChapterId,
      novelId,
      novelChapterId,
      comicIssueId,
      scheduledFor,
      timezone = "UTC",
      releaseNotes,
    } = req.body;

    if (!scheduledFor) {
      res.status(400).json({ error: "Scheduled date/time is required" });
      return;
    }

    const [schedule] = await db
      .insert(contentSchedules)
      .values({
        originalId: originalId || null,
        storyChapterId: storyChapterId || null,
        novelId: novelId || null,
        novelChapterId: novelChapterId || null,
        comicIssueId: comicIssueId || null,
        scheduledFor: new Date(scheduledFor),
        timezone,
        releaseNotes: releaseNotes || null,
        status: "scheduled",
      })
      .returning();

    res.status(201).json({ schedule });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to schedule release" });
  }
});

export default router;
