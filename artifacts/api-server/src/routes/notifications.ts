import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { notifications } from "@workspace/db/schema";
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
 * GET /api/notifications
 * Fetch user notifications
 */
router.get("/notifications", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    const unreadCount = userNotifs.filter((n) => !n.isRead).length;

    res.json({ notifications: userNotifs, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch notifications" });
  }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
router.post("/notifications/read-all", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, user.id));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to mark notifications read" });
  }
});

export default router;
