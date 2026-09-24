import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

function parseGenreAndDescription(rawDesc: string | null | undefined): { genre: string; description: string; is_original: boolean } {
  if (!rawDesc) return { genre: "Fantasy", description: "", is_original: false };
  let clean = rawDesc;
  let is_original = false;

  const origMatch = clean.match(/\[ORIGINAL:(true|false)\]/i);
  if (origMatch) {
    is_original = origMatch[1].toLowerCase() === "true";
    clean = clean.replace(/\[ORIGINAL:(true|false)\]\n?/gi, "");
  }

  const match = clean.match(/^\[GENRE:(.*?)\]\n?/);
  let genre = "Fantasy";
  if (match) {
    genre = match[1].trim();
    clean = clean.replace(/^\[GENRE:.*?\]\n?/, "").trim();
  }

  return { genre, description: clean, is_original };
}

function buildDescriptionWithGenre(genre: string | undefined, description: string | undefined, is_original?: boolean): string {
  const cleanGenre = genre ? genre.trim() : "Fantasy";
  const cleanDesc = (description || "").replace(/\[ORIGINAL:(true|false)\]\n?/gi, "").replace(/^\[GENRE:.*?\]\n?/, "").trim();
  const origTag = is_original !== undefined ? `[ORIGINAL:${is_original}]` : "";
  return `[GENRE:${cleanGenre}]${origTag}\n${cleanDesc}`;
}

/**
 * GET /api/admin/comics
 * List all comic series and novels with issue/chapter counts
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const [comicsRes, novelsRes] = await Promise.all([
      supabase
        .from("comic_series")
        .select(`
          id,
          title,
          arabic_title,
          description,
          status,
          publishing_status,
          cover_media_id,
          published_at,
          created_at,
          updated_at,
          media:cover_media_id ( secure_url )
        `)
        .order("created_at", { ascending: false }),
      supabase
        .from("novels")
        .select(`
          id,
          slug,
          title,
          arabic_title,
          summary,
          cover_url,
          status,
          total_chapters,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false })
    ]);

    // Fetch issue counts for comics
    const { data: issues } = await supabase.from("comic_issues").select("id, series_id");
    const issueCountMap: Record<string, number> = {};
    (issues || []).forEach(issue => {
      issueCountMap[issue.series_id] = (issueCountMap[issue.series_id] || 0) + 1;
    });

    const formattedComics = (comicsRes.data || []).map(s => {
      const { genre, description, is_original } = parseGenreAndDescription(s.description);
      return {
        ...s,
        description,
        genre,
        is_original: (s as any).is_original ?? is_original,
        category: "comic",
        coverUrl: (s.media as any)?.secure_url || null,
        issuesCount: issueCountMap[s.id] || 0,
      };
    });

    const formattedNovels = (novelsRes.data || []).map(n => {
      const { genre, description, is_original } = parseGenreAndDescription(n.summary);
      return {
        id: n.id,
        title: n.title,
        arabic_title: n.arabic_title,
        description,
        genre,
        is_original: (n as any).is_original ?? is_original,
        category: "novel",
        status: "Ongoing",
        publishing_status: n.status || "published",
        coverUrl: n.cover_url || null,
        issuesCount: n.total_chapters || 0,
        created_at: n.created_at,
        updated_at: n.updated_at,
      };
    });

    const result = [...formattedComics, ...formattedNovels].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ISSUES & CHAPTERS — registered BEFORE /:id to avoid Express route shadowing
// ============================================================================

/**
 * GET /api/admin/comics/issues/:issueId
 * Get issue details with all pages or novel chapter content
 */
router.get("/issues/:issueId", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId } = req.params;
    const { data: issue } = await supabase
      .from("comic_issues")
      .select(`
        *,
        series:series_id ( id, title, arabic_title ),
        media:cover_media_id ( secure_url )
      `)
      .eq("id", issueId)
      .maybeSingle();

    if (issue) {
      const { data: pages } = await supabase
        .from("comic_pages")
        .select(`
          id,
          page_number,
          media_id,
          alt_text,
          media:media_id ( secure_url, width, height, format )
        `)
        .eq("issue_id", issueId)
        .order("page_number", { ascending: true });

      res.json({
        ...issue,
        coverUrl: (issue.media as any)?.secure_url || null,
        pages: (pages || []).map(p => ({
          id: p.id,
          pageNumber: p.page_number,
          mediaId: p.media_id,
          altText: p.alt_text,
          imageUrl: (p.media as any)?.secure_url || null,
          width: (p.media as any)?.width,
          height: (p.media as any)?.height,
        })),
      });
      return;
    }

    // Check novel_chapters
    const { data: chapter } = await supabase
      .from("novel_chapters")
      .select("*")
      .eq("id", issueId)
      .maybeSingle();

    if (chapter) {
      res.json({
        id: chapter.id,
        series_id: chapter.novel_id,
        issue_number: chapter.chapter_number,
        title: chapter.title,
        arabic_title: chapter.arabic_title,
        summary: chapter.content,
        content: chapter.content,
        arabic_content: chapter.arabic_content,
        is_locked: chapter.is_locked,
        read_time_minutes: chapter.read_time_minutes,
        page_count: 0,
        status: "published",
        pages: [],
      });
      return;
    }

    res.status(404).json({ error: "Chapter or Issue not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/comics/issues/:issueId
 * Update comic issue or novel chapter text & details
 */
router.patch("/issues/:issueId", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId } = req.params;
    const user = (req as any).user;
    const { coverUrl, pages, series, media, content, arabic_content, is_locked, ...body } = req.body;
    if (body.cover_media_id === "") body.cover_media_id = null;

    // Check if in novel_chapters
    const { data: ch } = await supabase.from("novel_chapters").select("id, novel_id").eq("id", issueId).maybeSingle();

    if (ch) {
      const updates: any = {};
      if (body.issue_number !== undefined) updates.chapter_number = Number(body.issue_number);
      if (body.title !== undefined) updates.title = body.title;
      if (body.arabic_title !== undefined) updates.arabic_title = body.arabic_title;
      if (content !== undefined) {
        updates.content = content;
        const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
        updates.read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
      }
      if (arabic_content !== undefined) updates.arabic_content = arabic_content;
      if (is_locked !== undefined) updates.is_locked = !!is_locked;

      const { data: updatedCh, error: chErr } = await supabase
        .from("novel_chapters")
        .update(updates)
        .eq("id", issueId)
        .select()
        .single();

      if (chErr) throw chErr;

      res.json({
        id: updatedCh.id,
        series_id: updatedCh.novel_id,
        issue_number: updatedCh.chapter_number,
        title: updatedCh.title,
        arabic_title: updatedCh.arabic_title,
        summary: updatedCh.content,
        content: updatedCh.content,
        arabic_content: updatedCh.arabic_content,
        is_locked: updatedCh.is_locked,
        read_time_minutes: updatedCh.read_time_minutes,
        page_count: 0,
        status: "published",
      });
      return;
    }

    const { data, error } = await supabase
      .from("comic_issues")
      .update({
        ...body,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", issueId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/comics/issues/:issueId
 */
router.delete("/issues/:issueId", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId } = req.params;

    // Check if novel chapter
    const { data: ch } = await supabase.from("novel_chapters").select("novel_id").eq("id", issueId).maybeSingle();
    if (ch) {
      await supabase.from("novel_chapters").delete().eq("id", issueId);
      const { count } = await supabase.from("novel_chapters").select("id", { count: "exact" }).eq("novel_id", ch.novel_id);
      await supabase.from("novels").update({ total_chapters: count || 0 }).eq("id", ch.novel_id);
    } else {
      await supabase.from("comic_issues").delete().eq("id", issueId);
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SERIES / NOVEL by ID — registered AFTER /issues/* to prevent shadowing
// ============================================================================

/**
 * GET /api/admin/comics/:id
 * Get single series or novel with its issues/chapters
 */
router.get("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    // Check comic_series first
    const { data: series } = await supabase
      .from("comic_series")
      .select(`*, media:cover_media_id ( secure_url, alt_text )`)
      .eq("id", id)
      .maybeSingle();

    if (series) {
      const { data: issues } = await supabase
        .from("comic_issues")
        .select(`*, media:cover_media_id ( secure_url )`)
        .eq("series_id", id)
        .order("issue_number", { ascending: true });

      const { genre, description } = parseGenreAndDescription(series.description);
      res.json({
        ...series,
        description,
        genre,
        category: "comic",
        coverUrl: (series.media as any)?.secure_url || null,
        issues: (issues || []).map(iss => ({
          ...iss,
          coverUrl: (iss.media as any)?.secure_url || null,
        })),
      });
      return;
    }

    // Check novels table
    const { data: novel } = await supabase
      .from("novels")
      .select(`*`)
      .eq("id", id)
      .maybeSingle();

    if (novel) {
      const { data: chapters } = await supabase
        .from("novel_chapters")
        .select(`*`)
        .eq("novel_id", id)
        .order("chapter_number", { ascending: true });

      const { genre, description } = parseGenreAndDescription(novel.summary);
      res.json({
        id: novel.id,
        title: novel.title,
        arabic_title: novel.arabic_title,
        description,
        genre,
        category: "novel",
        status: "Ongoing",
        publishing_status: novel.status || "published",
        coverUrl: novel.cover_url || null,
        cover_media_id: null,
        issues: (chapters || []).map(ch => ({
          id: ch.id,
          issue_number: ch.chapter_number,
          title: ch.title,
          arabic_title: ch.arabic_title,
          summary: ch.content,
          content: ch.content,
          is_locked: ch.is_locked,
          coverUrl: null,
        })),
      });
      return;
    }

    res.status(404).json({ error: "Content not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/comics
 * Create a new comic series or novel
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const { category, genre, is_original, coverUrl, issuesCount, issues, media, ...body } = req.body;
    if (body.cover_media_id === "") body.cover_media_id = null;

    const formattedDesc = buildDescriptionWithGenre(genre, body.description, Boolean(is_original));

    if (category === "novel") {
      const novelId = body.id || `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const slug = (body.title || "novel").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + `-${Date.now().toString(36)}`;

      const { data: novel, error: novelErr } = await supabase
        .from("novels")
        .insert({
          id: novelId,
          slug,
          title: body.title,
          arabic_title: body.arabic_title || body.title,
          summary: formattedDesc,
          arabic_summary: formattedDesc,
          cover_url: coverUrl || null,
          status: body.publishing_status || "draft",
          total_chapters: 0,
        })
        .select()
        .single();

      if (novelErr) throw novelErr;

      try {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "CREATE",
          resource_type: "novel",
          resource_id: novel.id,
          details: { title: novel.title }
        });
      } catch (aErr) {
        console.warn("Audit log insert ignored:", aErr);
      }

      res.status(201).json({ ...novel, genre: genre || "Fantasy", is_original: Boolean(is_original), category: "novel" });
      return;
    }

    // Clean payload for comic_series
    const insertPayload: any = {
      title: body.title,
      arabic_title: body.arabic_title || null,
      description: formattedDesc,
      status: body.status || "Ongoing",
      publishing_status: body.publishing_status || "draft",
      cover_media_id: body.cover_media_id || null,
    };
    if (user?.id) {
      insertPayload.created_by = user.id;
      insertPayload.updated_by = user.id;
    }

    let { data, error } = await supabase
      .from("comic_series")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      delete insertPayload.created_by;
      delete insertPayload.updated_by;
      const retry = await supabase
        .from("comic_series")
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    try {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "CREATE",
        resource_type: "comic_series",
        resource_id: data.id,
        details: { title: data.title }
      });
    } catch (aErr) {
      console.warn("Audit log insert ignored:", aErr);
    }

    res.status(201).json({ ...data, genre: genre || "Fantasy", is_original: Boolean(is_original), category: "comic" });
  } catch (error: any) {
    console.error("Error creating series:", error);
    res.status(500).json({ error: error.message || "Failed to create series" });
  }
});

/**
 * PATCH /api/admin/comics/:id
 * Update comic series or novel
 */
router.patch("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const userRoles: string[] = (req as any).userRoles || [];
    const { category, genre, is_original, coverUrl, issuesCount, issues, media, ...body } = req.body;
    if (body.cover_media_id === "") body.cover_media_id = null;

    // Check if novel
    const { data: existingNovel } = await supabase.from("novels").select("*").eq("id", id).maybeSingle();

    if (existingNovel) {
      const existingParsed = parseGenreAndDescription(existingNovel.summary);
      const targetIsOriginal = is_original !== undefined ? Boolean(is_original) : existingParsed.is_original;
      const targetGenre = genre || existingParsed.genre;
      const targetDesc = body.description !== undefined ? body.description : existingParsed.description;
      const formattedDesc = buildDescriptionWithGenre(targetGenre, targetDesc, targetIsOriginal);

      if (body.publishing_status === "published") {
        // Enforce role permission: Only publishers, admins, super_admins can publish
        const canPublish = userRoles.some(r => ["publisher", "administrator", "super_admin"].includes(r));
        if (!canPublish) {
          res.status(403).json({ error: "Only publishers and administrators can publish content live." });
          return;
        }

        // Backend Blocking Validation
        const blockingErrors: string[] = [];
        const checkTitle = body.title !== undefined ? body.title : existingNovel.title;
        const checkCover = coverUrl !== undefined ? coverUrl : existingNovel.cover_url;
        const checkDesc = body.description !== undefined ? body.description : existingNovel.summary;

        if (!checkTitle || !checkTitle.trim()) blockingErrors.push("Novel title is required.");
        if (!checkCover || !checkCover.trim()) blockingErrors.push("Cover image is required before publishing.");
        if (!checkDesc || !checkDesc.trim()) blockingErrors.push("Description is required before publishing.");

        const { count: chCount } = await supabase
          .from("novel_chapters")
          .select("id", { count: "exact" })
          .eq("novel_id", id);

        if (!chCount || chCount === 0) blockingErrors.push("At least one chapter is required before publishing.");

        if (blockingErrors.length > 0) {
          res.status(400).json({ error: "Publish validation failed", blockingErrors });
          return;
        }
      }

      const updates: any = {
        summary: formattedDesc,
        arabic_summary: formattedDesc,
      };
      if (body.title) updates.title = body.title;
      if (body.arabic_title) updates.arabic_title = body.arabic_title;
      if (coverUrl !== undefined) updates.cover_url = coverUrl;
      if (body.publishing_status) updates.status = body.publishing_status;

      const { data: updatedNovel, error: nErr } = await supabase
        .from("novels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (nErr) throw nErr;
      res.json({ ...updatedNovel, genre: targetGenre, is_original: targetIsOriginal, category: "novel" });
      return;
    }

    const { data: existingComic } = await supabase.from("comic_series").select("*").eq("id", id).maybeSingle();
    const existingParsed = parseGenreAndDescription(existingComic?.description);
    const targetIsOriginal = is_original !== undefined ? Boolean(is_original) : existingParsed.is_original;
    const targetGenre = genre || existingParsed.genre;
    const targetDesc = body.description !== undefined ? body.description : existingParsed.description;
    const formattedDesc = buildDescriptionWithGenre(targetGenre, targetDesc, targetIsOriginal);

    if (body.publishing_status === "published") {
      const canPublish = userRoles.some(r => ["publisher", "administrator", "super_admin"].includes(r));
      if (!canPublish) {
        res.status(403).json({ error: "Only publishers and administrators can publish content live." });
        return;
      }

      const blockingErrors: string[] = [];
      const checkTitle = body.title !== undefined ? body.title : existingComic?.title;
      const checkCover = body.cover_media_id !== undefined ? body.cover_media_id : existingComic?.cover_media_id;
      const checkDesc = body.description !== undefined ? body.description : existingComic?.description;

      if (!checkTitle || !checkTitle.trim()) blockingErrors.push("Comic title is required.");
      if (!checkCover) blockingErrors.push("Cover image is required before publishing.");
      if (!checkDesc || !checkDesc.trim()) blockingErrors.push("Description is required before publishing.");

      const { count: issueCount } = await supabase
        .from("comic_issues")
        .select("id", { count: "exact" })
        .eq("series_id", id);

      if (!issueCount || issueCount === 0) blockingErrors.push("At least one issue is required before publishing.");

      if (blockingErrors.length > 0) {
        res.status(400).json({ error: "Publish validation failed", blockingErrors });
        return;
      }
    }

    const updatePayload: any = {
      description: formattedDesc,
      updated_at: new Date().toISOString()
    };
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.arabic_title !== undefined) updatePayload.arabic_title = body.arabic_title;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.publishing_status !== undefined) updatePayload.publishing_status = body.publishing_status;
    if (body.cover_media_id !== undefined) updatePayload.cover_media_id = body.cover_media_id;
    if (user?.id) updatePayload.updated_by = user.id;

    let { data, error } = await supabase
      .from("comic_series")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      delete updatePayload.updated_by;
      const retry = await supabase
        .from("comic_series")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    try {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "UPDATE",
        resource_type: "comic_series",
        resource_id: id
      });
    } catch (aErr) {
      console.warn("Audit log insert ignored:", aErr);
    }

    res.json({ ...data, genre: genre || "Fantasy", category: "comic" });
  } catch (error: any) {
    console.error("Error updating series:", error);
    res.status(500).json({ error: error.message || "Failed to update series" });
  }
});

/**
 * DELETE /api/admin/comics/:id
 */
router.delete("/:id", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    await supabase.from("novels").delete().eq("id", id);
    await supabase.from("comic_series").delete().eq("id", id);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "series",
      resource_id: id
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/comics/:id/issues
 * Create issue under a comic series or chapter under a novel
 */
router.post("/:id/issues", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId);
    const user = (req as any).user;
    const { issue_number, title, arabic_title, summary, content, arabic_content, is_locked, release_date, cover_media_id } = req.body;

    // Check if novel by ID format or by existing DB record
    const isNovelId = id.startsWith("novel-");
    let { data: novel } = await supabase.from("novels").select("id").eq("id", id).maybeSingle();
    const { data: comicSeries } = await supabase.from("comic_series").select("id, category, title, arabic_title").eq("id", id).maybeSingle();

    const isNovel = isNovelId || !!novel || (comicSeries && comicSeries.category === "novel");

    if (isNovel) {
      // Auto-create stub novel record in 'novels' if it doesn't exist yet to satisfy FK novel_id
      if (!novel) {
        const slug = (comicSeries?.title || title || "novel").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + `-${Date.now().toString(36)}`;
        const { data: createdNovel, error: createErr } = await supabase
          .from("novels")
          .insert({
            id,
            slug,
            title: comicSeries?.title || title || "Untitled Novel",
            arabic_title: comicSeries?.arabic_title || arabic_title || "رواية جديدة",
            status: "draft",
            total_chapters: 0,
          })
          .select("id")
          .single();

        if (createErr && createErr.code !== "23505") {
          console.error("Failed to auto-create novel stub:", createErr);
        } else {
          novel = createdNovel || { id };
        }
      }

      const chapterId = `ch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const chapterNum = Number(issue_number) || 1;
      const textContent = content || summary || "";
      const textArabic = arabic_content || summary || textContent;
      const wordCount = textContent.split(/\s+/).filter(Boolean).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      const { data: newChapter, error: chErr } = await supabase
        .from("novel_chapters")
        .insert({
          id: chapterId,
          novel_id: id,
          chapter_number: chapterNum,
          title: title || `Chapter ${chapterNum}`,
          arabic_title: arabic_title || title || `الفصل ${chapterNum}`,
          content: textContent,
          arabic_content: textArabic,
          is_locked: !!is_locked,
          read_time_minutes: readTime,
        })
        .select()
        .single();

      if (chErr) {
        console.error("Failed to insert into novel_chapters:", chErr);
        throw chErr;
      }

      // Update total_chapters in novels
      const { count } = await supabase.from("novel_chapters").select("id", { count: "exact" }).eq("novel_id", id);
      await supabase.from("novels").update({ total_chapters: count || 0 }).eq("id", id);

      res.status(201).json({
        id: newChapter.id,
        series_id: newChapter.novel_id,
        issue_number: newChapter.chapter_number,
        title: newChapter.title,
        arabic_title: newChapter.arabic_title,
        summary: newChapter.content,
        content: newChapter.content,
        arabic_content: newChapter.arabic_content,
        is_locked: newChapter.is_locked,
        read_time_minutes: newChapter.read_time_minutes,
        page_count: 0,
        status: "published",
      });
      return;
    }

    const { data, error } = await supabase
      .from("comic_issues")
      .insert({
        series_id: id,
        issue_number: Number(issue_number) || 1,
        title,
        arabic_title,
        summary,
        release_date: release_date || null,
        cover_media_id: cover_media_id || null,
        status: "draft",
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert into comic_issues:", error);
      throw error;
    }

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE",
      resource_type: "comic_issue",
      resource_id: data.id,
      details: { title: data.title, issue_number: data.issue_number }
    });

    res.status(201).json(data);
  } catch (error: any) {
    console.error("POST /:id/issues Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

/**
 * PATCH /api/admin/comics/issues/:issueId (moved up — see above)
 * Update comic issue or novel chapter text & details
 */
router.patch("/issues/:issueId", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId } = req.params;
    const user = (req as any).user;
    const { coverUrl, pages, series, media, content, arabic_content, is_locked, ...body } = req.body;
    if (body.cover_media_id === "") body.cover_media_id = null;

    // Check if in novel_chapters
    const { data: ch } = await supabase.from("novel_chapters").select("id, novel_id").eq("id", issueId).maybeSingle();

    if (ch) {
      const updates: any = {};
      if (body.issue_number !== undefined) updates.chapter_number = Number(body.issue_number);
      if (body.title !== undefined) updates.title = body.title;
      if (body.arabic_title !== undefined) updates.arabic_title = body.arabic_title;
      if (content !== undefined) {
        updates.content = content;
        const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
        updates.read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
      }
      if (arabic_content !== undefined) updates.arabic_content = arabic_content;
      if (is_locked !== undefined) updates.is_locked = !!is_locked;

      const { data: updatedCh, error: chErr } = await supabase
        .from("novel_chapters")
        .update(updates)
        .eq("id", issueId)
        .select()
        .single();

      if (chErr) throw chErr;

      res.json({
        id: updatedCh.id,
        series_id: updatedCh.novel_id,
        issue_number: updatedCh.chapter_number,
        title: updatedCh.title,
        arabic_title: updatedCh.arabic_title,
        summary: updatedCh.content,
        content: updatedCh.content,
        arabic_content: updatedCh.arabic_content,
        is_locked: updatedCh.is_locked,
        read_time_minutes: updatedCh.read_time_minutes,
        page_count: 0,
        status: "published",
      });
      return;
    }

    const { data, error } = await supabase
      .from("comic_issues")
      .update({
        ...body,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", issueId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/comics/issues/:issueId/pages
 * Add page to comic issue
 */
router.post("/issues/:issueId/pages", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId } = req.params;
    const { media_id, page_number, alt_text } = req.body;

    const { data, error } = await supabase
      .from("comic_pages")
      .insert({
        issue_id: issueId,
        media_id,
        page_number: Number(page_number) || 1,
        alt_text: alt_text || null
      })
      .select(`
        id,
        page_number,
        media_id,
        alt_text,
        media:media_id ( secure_url )
      `)
      .single();

    if (error) throw error;

    // Update page_count on issue
    const { count } = await supabase.from("comic_pages").select("id", { count: "exact" }).eq("issue_id", issueId);
    await supabase.from("comic_issues").update({ page_count: count || 0 }).eq("id", issueId);

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/comics/issues/:issueId/pages/reorder
 * Batch update page ordering
 */
router.patch("/issues/:issueId/pages/reorder", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId } = req.params;
    const { pageOrders } = req.body; // Array of { id: string, pageNumber: number }

    if (!Array.isArray(pageOrders)) {
      res.status(400).json({ error: "pageOrders must be an array" });
      return;
    }

    await Promise.all(
      pageOrders.map(item =>
        supabase.from("comic_pages").update({ page_number: item.pageNumber }).eq("id", item.id).eq("issue_id", issueId)
      )
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/comics/issues/:issueId/pages/:pageId
 */
router.delete("/issues/:issueId/pages/:pageId", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { issueId, pageId } = req.params;
    const { error } = await supabase.from("comic_pages").delete().eq("id", pageId).eq("issue_id", issueId);
    if (error) throw error;

    // Update page_count on issue
    const { count } = await supabase.from("comic_pages").select("id", { count: "exact" }).eq("issue_id", issueId);
    await supabase.from("comic_issues").update({ page_count: count || 0 }).eq("id", issueId);

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
