import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

async function checkIsAuthorizedAdmin(authHeader: string | undefined): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.split(" ")[1];
  try {
    const { data: authData } = await supabase.auth.getUser(token);
    if (!authData?.user) return false;

    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("user_profiles").select("role").eq("id", authData.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", authData.user.id),
    ]);

    const userRoles: string[] = [];
    if (profileRes.data?.role) {
      userRoles.push(profileRes.data.role);
    }
    if (rolesRes.data) {
      rolesRes.data.forEach((r: any) => {
        if (!userRoles.includes(r.role)) userRoles.push(r.role);
      });
    }

    const allowedRoles = ["editor", "publisher", "administrator", "super_admin", "admin", "writer"];
    return allowedRoles.some((role) => userRoles.includes(role));
  } catch (err) {
    console.error("checkIsAuthorizedAdmin error:", err);
    return false;
  }
}

async function checkUserSubscription(authHeader: string | undefined): Promise<{ authorized: boolean; userId?: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return { authorized: false };
  const token = authHeader.split(" ")[1];
  const { data: authData } = await supabase.auth.getUser(token);
  if (!authData?.user) return { authorized: false };

  // Admins always get access
  const isAdmin = await checkIsAuthorizedAdmin(authHeader);
  if (isAdmin) return { authorized: true, userId: authData.user.id };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return { authorized: !!sub, userId: authData.user.id };
}

router.get("/novels", async (req: Request, res: Response) => {
  try {
    const isPreview = req.query.preview === "true";
    let query = supabase.from("novels").select("*");

    if (!isPreview) {
      query = query.eq("status", "published");
    } else {
      const isAuthorized = await checkIsAuthorizedAdmin(req.headers.authorization);
      if (!isAuthorized) {
        query = query.eq("status", "published");
      }
    }

    const { data: dbNovels, error } = await query;
    if (error) {
      console.error("Error fetching novels from Supabase:", error.message);
      return res.status(500).json({ error: "Failed to fetch novels" });
    }

    const formatted = (dbNovels || []).map((n: any) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      arabicTitle: n.arabic_title || n.title,
      tagline: n.tagline || "",
      arabicTagline: n.arabic_tagline || n.tagline || "",
      summary: n.summary || "",
      arabicSummary: n.arabic_summary || n.summary || "",
      coverUrl: n.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
      bannerUrl: n.banner_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
      authorName: n.author_name || "Hekayaty Team",
      arabicAuthorName: n.arabic_author_name || "فريق حكاياتي",
      totalChapters: n.total_chapters || 0,
      rating: n.rating || "4.9",
      isPremium: n.is_premium || false,
      isFeatured: n.is_featured || false,
      status: n.status || "draft",
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.get("/novels/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const isPreview = req.query.preview === "true";

    const { data: dbNovel, error } = await supabase
      .from("novels")
      .select("*")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (error || !dbNovel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    if (dbNovel.status === "draft" && !isPreview) {
      return res.status(404).json({ error: "Novel is not published" });
    }

    if (dbNovel.status === "draft" && isPreview) {
      const isAuthorized = await checkIsAuthorizedAdmin(req.headers.authorization);
      if (!isAuthorized) {
        return res.status(403).json({ error: "Unauthorized preview access" });
      }
    }

    const { data: dbChapters } = await supabase
      .from("novel_chapters")
      .select("id, novel_id, chapter_number, title, arabic_title, is_locked, read_time_minutes, content")
      .eq("novel_id", dbNovel.id)
      .order("chapter_number");

    res.json({
      id: dbNovel.id,
      slug: dbNovel.slug,
      title: dbNovel.title,
      arabicTitle: dbNovel.arabic_title || dbNovel.title,
      tagline: dbNovel.tagline || "",
      arabicTagline: dbNovel.arabic_tagline || dbNovel.tagline || "",
      summary: dbNovel.summary || "",
      arabicSummary: dbNovel.arabic_summary || dbNovel.summary || "",
      coverUrl: dbNovel.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
      bannerUrl: dbNovel.banner_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
      authorName: dbNovel.author_name || "Hekayaty Team",
      arabicAuthorName: dbNovel.arabic_author_name || "فريق حكاياتي",
      totalChapters: dbNovel.total_chapters || (dbChapters?.length || 0),
      rating: dbNovel.rating || "4.9",
      isPremium: dbNovel.is_premium || false,
      isFeatured: dbNovel.is_featured || false,
      status: dbNovel.status || "draft",
      chapters: (dbChapters || []).map((c: any) => ({
        id: c.id,
        chapterNumber: c.chapter_number,
        title: c.title,
        arabicTitle: c.arabic_title || c.title,
        readTimeMinutes: c.read_time_minutes || 5,
        isLocked: c.is_locked || false,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

/**
 * GET /api/novels/chapters/:chapterId
 * Fetch single chapter with server-authoritative lock enforcement & preview check
 */
router.get("/novels/chapters/:chapterId", async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const isPreview = req.query.preview === "true";

    const { data: chapter, error } = await supabase
      .from("novel_chapters")
      .select("*, novel:novel_id ( id, slug, title, arabic_title, status )")
      .eq("id", chapterId)
      .maybeSingle();

    if (error || !chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const parentNovel = (chapter.novel as any) || {};
    const parentNovelStatus = parentNovel.status || "published";
    const isDraftContent = parentNovelStatus === "draft" || chapter.status === "draft";

    if (isDraftContent && !isPreview) {
      return res.status(404).json({ error: "Chapter not published" });
    }

    if (isDraftContent && isPreview) {
      const isAuthorized = await checkIsAuthorizedAdmin(req.headers.authorization);
      if (!isAuthorized) {
        return res.status(403).json({ error: "Unauthorized preview request" });
      }
    }

    // Fetch sibling chapters for navigation & drawer
    const { data: siblingChapters } = await supabase
      .from("novel_chapters")
      .select("id, chapter_number, title, arabic_title, is_locked, read_time_minutes")
      .eq("novel_id", chapter.novel_id)
      .order("chapter_number");

    const chaptersList = (siblingChapters || []).map((c: any) => ({
      id: c.id,
      chapterNumber: c.chapter_number,
      title: c.title,
      arabicTitle: c.arabic_title || c.title,
      isLocked: !!c.is_locked,
      readTimeMinutes: c.read_time_minutes || 5,
    }));

    const currentIndex = chaptersList.findIndex((c: any) => c.id === chapter.id);
    const prevChapter = currentIndex > 0 ? chaptersList[currentIndex - 1] : null;
    const nextChapter = currentIndex < chaptersList.length - 1 ? chaptersList[currentIndex + 1] : null;

    // Lock enforcement for subscriber-only chapters:
    // First 3 chapters are free preview for all users.
    // Chapters > 3 require subscription or authenticated login.
    const isFreePreviewChapter = (chapter.chapter_number || 1) <= 3 || !chapter.is_locked;
    if (!isFreePreviewChapter) {
      const subCheck = await checkUserSubscription(req.headers.authorization);
      // If user is neither authorized via subscription/role nor logged in
      if (!subCheck.authorized && !subCheck.userId) {
        return res.status(403).json({
          error: "Subscription Required",
          message: "This novel chapter is exclusive to Hekayaty subscribers.",
          isLocked: true,
          chapterNumber: chapter.chapter_number,
          title: chapter.title,
          arabicTitle: chapter.arabic_title,
          novelId: chapter.novel_id,
          novelSlug: parentNovel.slug || chapter.novel_id,
          novelTitle: parentNovel.title,
          novelArabicTitle: parentNovel.arabic_title,
          chapters: chaptersList,
          prevChapterId: prevChapter?.id || null,
          nextChapterId: nextChapter?.id || null,
          content: null, // Protected content body is omitted!
        });
      }
    }

    res.json({
      id: chapter.id,
      novelId: chapter.novel_id,
      novelSlug: parentNovel.slug || chapter.novel_id,
      novelTitle: parentNovel.title,
      novelArabicTitle: parentNovel.arabic_title,
      chapterNumber: chapter.chapter_number,
      title: chapter.title,
      arabicTitle: chapter.arabic_title,
      content: chapter.content,
      arabicContent: chapter.arabic_content || chapter.content,
      readTimeMinutes: chapter.read_time_minutes || 5,
      isLocked: !!chapter.is_locked,
      isDraft: parentNovelStatus === "draft",
      chapters: chaptersList,
      prevChapterId: prevChapter?.id || null,
      nextChapterId: nextChapter?.id || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;

