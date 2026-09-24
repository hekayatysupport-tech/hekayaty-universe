import { Router } from "express";
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

/**
 * GET /api/comics
 */
router.get("/comics", async (req, res) => {
  const isPreview = req.query.preview === "true";
  let query = supabase
    .from("comic_series")
    .select(`id, title, arabic_title, description, status, publishing_status, media:cover_media_id ( secure_url, alt_text )`)
    .order("title");

  if (!isPreview) {
    query = query.eq("publishing_status", "published");
  } else {
    const isAuthorized = await checkIsAuthorizedAdmin(req.headers.authorization);
    if (!isAuthorized) {
      query = query.eq("publishing_status", "published");
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching comics:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }

  const result = (data ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    arabicTitle: s.arabic_title,
    description: s.description,
    status: s.status,
    publishingStatus: s.publishing_status || "draft",
    coverUrl: s.media?.secure_url ?? null,
    coverAlt: s.media?.alt_text ?? null,
  }));

  res.json(result);
});

/**
 * GET /api/comics/:id
 */
router.get("/comics/:id", async (req, res) => {
  const { id } = req.params;
  const isPreview = req.query.preview === "true";

  const { data: series, error: seriesErr } = await supabase
    .from("comic_series")
    .select(`id, title, arabic_title, description, status, publishing_status, media:cover_media_id ( secure_url )`)
    .eq("id", id)
    .single();

  if (seriesErr || !series) {
    return res.status(404).json({ error: "Series not found" });
  }

  const pubStatus = (series as any).publishing_status || "draft";
  if (pubStatus === "draft" && !isPreview) {
    return res.status(404).json({ error: "Series not published" });
  }

  if (pubStatus === "draft" && isPreview) {
    const isAuthorized = await checkIsAuthorizedAdmin(req.headers.authorization);
    if (!isAuthorized) {
      return res.status(403).json({ error: "Unauthorized preview access" });
    }
  }

  const { data: issues } = await supabase
    .from("comic_issues")
    .select(`id, issue_number, title, arabic_title, description, release_date, reading_order_global, is_special_edition, access_level, status, media:cover_media_id ( secure_url )`)
    .eq("series_id", id)
    .order("issue_number");

  const s = series as any;
  res.json({
    id: s.id,
    title: s.title,
    arabicTitle: s.arabic_title,
    description: s.description,
    status: s.status,
    publishingStatus: s.publishing_status || "draft",
    coverUrl: s.media?.secure_url ?? null,
    issues: (issues ?? []).map((i: any) => ({
      id: i.id,
      issueNumber: i.issue_number,
      title: i.title,
      arabicTitle: i.arabic_title,
      description: i.description,
      releaseDate: i.release_date,
      readingOrderGlobal: i.reading_order_global,
      isSpecialEdition: i.is_special_edition,
      accessLevel: i.access_level || "public",
      status: i.status || "draft",
      coverUrl: i.media?.secure_url ?? null,
    })),
  });
});

/**
 * GET /api/comics/issues/:issueId/pages
 * Returns page images for a comic issue. Server-authoritative lock enforcement!
 */
router.get("/comics/issues/:issueId/pages", async (req, res) => {
  try {
    const { issueId } = req.params;
    const isPreview = req.query.preview === "true";

    const { data: issue, error } = await supabase
      .from("comic_issues")
      .select("*, series:series_id ( title, arabic_title, publishing_status )")
      .eq("id", issueId)
      .single();

    if (error || !issue) {
      return res.status(404).json({ error: "Comic issue not found" });
    }

    const seriesPubStatus = (issue.series as any)?.publishing_status || "draft";
    if ((seriesPubStatus === "draft" || issue.status === "draft") && !isPreview) {
      return res.status(404).json({ error: "Comic issue is not published" });
    }

    if ((seriesPubStatus === "draft" || issue.status === "draft") && isPreview) {
      const isAuthorized = await checkIsAuthorizedAdmin(req.headers.authorization);
      if (!isAuthorized) {
        return res.status(403).json({ error: "Unauthorized preview access" });
      }
    }

    const accessLevel = issue.access_level || "public";

    // Server-Authoritative Lock Check for Subscriber-only comic issues
    if (accessLevel === "subscriber") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Sign in to access this premium Hekayaty Originals comic issue.",
          isLocked: true,
          pages: [],
        });
      }

      const token = authHeader.split(" ")[1];
      const { data: authData } = await supabase.auth.getUser(token);
      if (!authData?.user) {
        return res.status(401).json({ error: "Invalid token", pages: [] });
      }

      // Check if user is an authorized admin previewer
      const isAdmin = await checkIsAuthorizedAdmin(authHeader);
      if (!isAdmin) {
        // Verify Active Subscription in DB
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
            message: "This comic issue is exclusive to Hekayaty Originals subscribers.",
            isLocked: true,
            pages: [], // Pages array is completely omitted / emptied for security!
          });
        }
      }
    }

    // Fetch Issue Pages
    const { data: pages } = await supabase
      .from("comic_pages")
      .select("page_number, media:media_id ( secure_url )")
      .eq("issue_id", issueId)
      .order("page_number");

    res.json({
      issueId: issue.id,
      issueNumber: issue.issue_number,
      title: issue.title,
      arabicTitle: issue.arabic_title,
      seriesTitle: issue.series?.title,
      isLocked: false,
      pages: (pages || []).map((p: any) => ({
        pageNumber: p.page_number,
        imageUrl: p.media?.secure_url || null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching comic pages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

