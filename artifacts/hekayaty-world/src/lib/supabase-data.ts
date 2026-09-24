/**
 * Supabase-Direct Data Service
 *
 * This module completely replaces all /api/* fetch calls by querying
 * Supabase directly from the frontend. Auth already works this way
 * (Supabase client -> Supabase), so this is the most reliable approach.
 */

import { supabase } from "./supabase";

function mediaUrl(media: any, fallback: string | null = null): string | null {
  if (!media) return fallback;
  return media.secure_url ?? media.url ?? fallback;
}

// ─── COMICS ────────────────────────────────────────────────────────────────────

export async function fetchComics(preview = false): Promise<any[]> {
  let query = supabase
    .from("comic_series")
    .select(`id, title, arabic_title, description, status, publishing_status, media:cover_media_id ( secure_url, alt_text )`)
    .order("title");

  if (!preview) {
    query = query.eq("publishing_status", "published");
  }

  let { data, error } = await query;

  if (error) {
    const fallback = await supabase.from("comic_series").select("*").order("title");
    data = fallback.data;
    error = fallback.error;
  }

  return (data ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    arabicTitle: s.arabic_title,
    description: s.description,
    status: s.status,
    publishingStatus: s.publishing_status || "draft",
    coverUrl: mediaUrl(s.media, s.cover_url ?? null),
    coverAlt: s.media?.alt_text ?? s.title ?? null,
  }));
}

export async function fetchComicById(id: string, preview = false): Promise<any | null> {
  const { data: series, error: seriesErr } = await supabase
    .from("comic_series")
    .select(`id, title, arabic_title, description, status, publishing_status, media:cover_media_id ( secure_url )`)
    .eq("id", id)
    .single();

  if (seriesErr || !series) return null;

  const pubStatus = (series as any).publishing_status || "draft";
  if (pubStatus === "draft" && !preview) return null;

  const { data: issues } = await supabase
    .from("comic_issues")
    .select(`id, issue_number, title, arabic_title, description, release_date, reading_order_global, is_special_edition, status, media:cover_media_id ( secure_url )`)
    .eq("series_id", id)
    .order("issue_number");

  const s = series as any;
  return {
    id: s.id,
    title: s.title,
    arabicTitle: s.arabic_title,
    description: s.description,
    status: s.status,
    publishingStatus: pubStatus,
    coverUrl: mediaUrl(s.media),
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
      coverUrl: mediaUrl(i.media),
    })),
  };
}

export async function fetchComicPages(issueId: string): Promise<any> {
  const { data: issue, error } = await supabase
    .from("comic_issues")
    .select("*, series:series_id ( title, arabic_title, publishing_status )")
    .eq("id", issueId)
    .single();

  if (error || !issue) return { error: "Comic issue not found", pages: [] };

  const seriesPubStatus = (issue.series as any)?.publishing_status || "draft";
  if (seriesPubStatus === "draft" || issue.status === "draft") {
    return { error: "Comic issue is not published", pages: [] };
  }

  const { data: pages } = await supabase
    .from("comic_pages")
    .select("page_number, media:media_id ( secure_url )")
    .eq("issue_id", issueId)
    .order("page_number");

  return {
    issueId: issue.id,
    issueNumber: issue.issue_number,
    title: issue.title,
    arabicTitle: issue.arabic_title,
    seriesTitle: (issue.series as any)?.title,
    isLocked: false,
    pages: (pages || []).map((p: any) => ({
      pageNumber: p.page_number,
      imageUrl: p.media?.secure_url || null,
    })),
  };
}

// ─── CHARACTERS ────────────────────────────────────────────────────────────────

export async function fetchCharacters(): Promise<any[]> {
  let { data, error } = await supabase
    .from("characters")
    .select(`id, name, arabic_name, alias, title, quote, alignment, status, power_category, organization, short_bio, media:portrait_media_id ( secure_url, alt_text )`)
    .order("name");

  if (error) {
    const fallback = await supabase.from("characters").select("*").order("name");
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) return [];

  const { data: statsData } = await supabase.from("character_stats").select("*");
  const statsMap: Record<string, any> = {};
  (statsData || []).forEach((s: any) => { statsMap[s.character_id] = s; });

  return (data ?? []).map((c: any) => {
    const s = statsMap[c.id];
    return {
      id: c.id,
      name: c.name,
      arabicName: c.arabic_name,
      alias: c.alias,
      title: c.title,
      quote: c.quote,
      alignment: c.alignment,
      status: c.status,
      powerCategory: c.power_category,
      organization: c.organization,
      shortBio: c.short_bio,
      portraitUrl: mediaUrl(c.media, c.portrait_url ?? null),
      portraitAlt: c.media?.alt_text ?? c.name ?? null,
      stats: s ? { strength: s.strength, speed: s.speed, intelligence: s.intelligence, wisdom: s.wisdom, willpower: s.willpower, magic: s.magic } : null,
    };
  });
}

export async function fetchCharacterById(id: string): Promise<any | null> {
  const [charRes, statsRes, abilitiesRes, relationshipsRes, galleryRes, worldsRes] = await Promise.all([
    supabase.from("characters").select(`id, name, arabic_name, alias, title, quote, alignment, status, power_category, organization, short_bio, full_bio, about_text, media:portrait_media_id ( secure_url, alt_text )`).eq("id", id).single(),
    supabase.from("character_stats").select("strength, speed, intelligence, wisdom, willpower, magic").eq("character_id", id).maybeSingle(),
    supabase.from("character_abilities").select("id, name, description").eq("character_id", id),
    supabase.from("character_relationships").select(`id, relation_type, description, character_b:character_b_id ( id, name, arabic_name, media:portrait_media_id ( secure_url ) )`).eq("character_a_id", id),
    supabase.from("character_gallery").select(`sort_order, media:media_id ( id, secure_url, alt_text )`).eq("character_id", id).order("sort_order"),
    supabase.from("character_worlds").select(`relationship, world:world_id ( id, name, arabic_name, media:cover_media_id ( secure_url ) )`).eq("character_id", id),
  ]);

  if (charRes.error || !charRes.data) return null;

  const c = charRes.data as any;
  return {
    id: c.id,
    name: c.name,
    arabicName: c.arabic_name,
    alias: c.alias,
    title: c.title,
    quote: c.quote,
    alignment: c.alignment,
    status: c.status,
    powerCategory: c.power_category,
    organization: c.organization,
    shortBio: c.short_bio,
    fullBio: c.full_bio,
    aboutText: c.about_text,
    portraitUrl: mediaUrl(c.media),
    portraitAlt: c.media?.alt_text ?? null,
    stats: statsRes.data ?? null,
    abilities: abilitiesRes.data ?? [],
    relationships: (relationshipsRes.data ?? []).map((r: any) => ({
      id: r.id,
      relationType: r.relation_type,
      description: r.description,
      relatedCharacter: r.character_b ? { id: r.character_b.id, name: r.character_b.name, arabicName: r.character_b.arabic_name, portraitUrl: mediaUrl(r.character_b.media) } : null,
    })),
    gallery: (galleryRes.data ?? []).map((g: any) => ({ id: g.media?.id, secureUrl: g.media?.secure_url ?? null, altText: g.media?.alt_text ?? null })),
    worlds: (worldsRes.data ?? []).map((w: any) => ({ worldId: w.world?.id, worldName: w.world?.name ?? null, worldArabicName: w.world?.arabic_name ?? null, relationship: w.relationship, coverUrl: mediaUrl(w.world?.media) })),
  };
}

// ─── WORLDS ────────────────────────────────────────────────────────────────────

export async function fetchWorlds(): Promise<any[]> {
  let { data, error } = await supabase
    .from("worlds")
    .select(`id, name, arabic_name, description, media:cover_media_id ( secure_url, alt_text )`)
    .order("name");

  if (error) {
    const fallback = await supabase.from("worlds").select("*").order("name");
    data = fallback.data;
    error = fallback.error;
  }

  return (data ?? []).map((w: any) => ({
    id: w.id,
    worldName: w.name,
    worldArabicName: w.arabic_name,
    description: w.description,
    coverUrl: mediaUrl(w.media, w.cover_url ?? null),
    coverAlt: w.media?.alt_text ?? w.name ?? null,
  }));
}

export async function fetchWorldById(id: string): Promise<any | null> {
  const { data: world, error: worldErr } = await supabase
    .from("worlds")
    .select(`id, name, arabic_name, description, media:cover_media_id ( secure_url )`)
    .eq("id", id)
    .single();

  if (worldErr || !world) return null;

  const { data: regions } = await supabase
    .from("regions")
    .select(`id, name, arabic_name, description, media:cover_media_id ( secure_url )`)
    .eq("world_id", id)
    .order("name");

  const w = world as any;
  return {
    id: w.id,
    worldName: w.name,
    worldArabicName: w.arabic_name,
    description: w.description,
    coverUrl: mediaUrl(w.media),
    regions: (regions ?? []).map((r: any) => ({
      id: r.id, name: r.name, arabicName: r.arabic_name, description: r.description, coverUrl: mediaUrl(r.media),
    })),
  };
}

// ─── NOVELS ────────────────────────────────────────────────────────────────────

export async function fetchNovels(preview = false): Promise<any[]> {
  let query = supabase.from("novels").select("*");
  if (!preview) query = query.eq("status", "published");

  const { data: dbNovels, error } = await query;
  if (error) return [];

  return (dbNovels || []).map((n: any) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    arabicTitle: n.arabic_title || n.title,
    authorName: n.author_name,
    arabicAuthorName: n.arabic_author_name,
    summary: n.summary,
    arabicSummary: n.arabic_summary,
    coverUrl: n.cover_url || null,
    bannerUrl: n.banner_url || null,
    status: n.status,
    isPremium: Boolean(n.is_premium),
    totalChapters: n.total_chapters || 0,
    rating: n.rating || null,
    tagline: n.tagline,
    arabicTagline: n.arabic_tagline,
    createdAt: n.created_at,
  }));
}

// ─── ORIGINALS ────────────────────────────────────────────────────────────────

export async function fetchOriginals(filters?: { type?: string; access?: string; featured?: boolean; }): Promise<any[]> {
  let query = supabase
    .from("originals")
    .select(`id, title, arabic_title, slug, tagline, description, arabic_description, content_type, access_level, status, is_featured, is_trending, is_new, is_coming_soon, creator_name, release_date, cover_media:cover_media_id ( secure_url, alt_text ), banner_media:banner_media_id ( secure_url, alt_text )`)
    .order("created_at", { ascending: false });

  if (filters?.type) query = query.eq("content_type", filters.type);
  if (filters?.access) query = query.eq("access_level", filters.access);
  if (filters?.featured) query = query.eq("is_featured", true);

  const { data: dbOriginals, error } = await query;
  if (error) console.warn("Supabase originals query warning:", error.message);

  let result = (dbOriginals || []).map((o: any) => ({
    id: o.id,
    title: o.title,
    arabicTitle: o.arabic_title || o.title,
    slug: o.slug,
    tagline: o.tagline || "",
    description: o.description || "",
    arabicDescription: o.arabic_description || o.description || "",
    contentType: o.content_type || "story",
    accessLevel: o.access_level || "subscriber",
    status: o.status || "published",
    isFeatured: Boolean(o.is_featured),
    isTrending: Boolean(o.is_trending),
    isNew: Boolean(o.is_new),
    isComingSoon: Boolean(o.is_coming_soon),
    creatorName: o.creator_name || "Hekayaty Studios",
    coverUrl: mediaUrl(o.cover_media, o.cover_url ?? null),
    bannerUrl: mediaUrl(o.banner_media, o.banner_url ?? null),
    releaseDate: o.release_date,
  }));

  if (result.length === 0) {
    const { data: dbNovels } = await supabase.from("novels").select("*").order("created_at", { ascending: false });
    if (dbNovels && dbNovels.length > 0) {
      result = dbNovels.map((n: any, idx: number) => ({
        id: n.id,
        title: n.title,
        arabicTitle: n.arabic_title || n.title,
        slug: n.slug,
        tagline: n.arabic_tagline || n.tagline || "original production",
        description: n.summary || "",
        arabicDescription: n.arabic_summary || n.summary || "",
        contentType: "Novel",
        accessLevel: n.is_premium ? "subscriber" : "public",
        status: "published",
        isFeatured: idx === 0,
        isTrending: true,
        isNew: true,
        isComingSoon: false,
        creatorName: n.arabic_author_name || n.author_name || "Hekayaty Studios",
        coverUrl: n.cover_url || null,
        bannerUrl: n.banner_url || null,
        releaseDate: n.created_at,
        rating: n.rating || "4.9",
        totalChapters: n.total_chapters || 12,
      }));
    }
  }

  return result;
}

export async function fetchOriginalsShowcase(): Promise<any> {
  const [originalsRes, comicsRes, novelsRes, worldsRes] = await Promise.all([
    supabase.from("originals").select("*, cover_media:cover_media_id ( secure_url ), banner_media:banner_media_id ( secure_url )").order("created_at", { ascending: false }),
    supabase.from("comic_series").select("*, media:cover_media_id ( secure_url )").order("created_at", { ascending: false }),
    supabase.from("novels").select("*").order("created_at", { ascending: false }),
    supabase.from("worlds").select("*, cover_media:cover_media_id ( secure_url )").order("created_at", { ascending: false }),
  ]);

  const originals = (originalsRes.data || []).map((o: any) => ({
    id: o.id, title: o.title, arabicTitle: o.arabic_title || o.title, slug: o.slug,
    tagline: o.tagline || "", description: o.description || "", arabicDescription: o.arabic_description || o.description || "",
    contentType: o.content_type || "story", accessLevel: o.access_level || "subscriber",
    isFeatured: Boolean(o.is_featured), isTrending: Boolean(o.is_trending), isNew: Boolean(o.is_new), isComingSoon: Boolean(o.is_coming_soon),
    creatorName: o.creator_name || "Hekayaty Studios",
    coverUrl: mediaUrl(o.cover_media, o.cover_url ?? null),
    bannerUrl: mediaUrl(o.banner_media, o.banner_url ?? null),
    releaseDate: o.release_date,
  }));

  const comics = (comicsRes.data || []).map((c: any) => ({
    id: c.id, title: c.title, arabicTitle: c.arabic_title || c.title, coverUrl: mediaUrl(c.media, c.cover_url ?? null), status: c.status,
  }));

  const novels = (novelsRes.data || []).map((n: any) => ({
    id: n.id, title: n.title, arabicTitle: n.arabic_title || n.title, coverUrl: n.cover_url || null, authorName: n.author_name, totalChapters: n.total_chapters || 0,
  }));

  const worlds = (worldsRes.data || []).map((w: any) => ({
    id: w.id, worldName: w.name, worldArabicName: w.arabic_name, coverUrl: mediaUrl(w.cover_media, w.cover_url ?? null),
  }));

  let featuredProject: any = null;
  if (originals.length > 0) {
    const featured = originals.find((o: any) => o.isFeatured) || originals[0];
    featuredProject = { ...featured };
  } else if (novels.length > 0) {
    const n = novels[0] as any;
    featuredProject = { id: n.id, title: n.title, arabicTitle: n.arabicTitle, tagline: "original from Hekayaty", arabicDescription: "exclusive Hekayaty novel", contentType: "Novel", coverUrl: n.coverUrl, bannerUrl: n.coverUrl, isFeatured: true };
  }

  return { featuredProject, originals, comics, novels, worlds, collections: [], timeline: [] };
}

// ─── WRITERS ────────────────────────────────────────────────────────────────────

export async function fetchWriters(): Promise<any[]> {
  const { data, error } = await supabase
    .from("writers")
    .select(`id, pen_name, arabic_pen_name, bio, arabic_bio, specialty, social_links, is_featured, profile_media:profile_media_id ( secure_url, alt_text )`)
    .order("pen_name");

  if (error || !data) return [];

  return (data ?? []).map((w: any) => ({
    id: w.id, penName: w.pen_name, arabicPenName: w.arabic_pen_name,
    bio: w.bio, arabicBio: w.arabic_bio, specialty: w.specialty,
    socialLinks: w.social_links, isFeatured: Boolean(w.is_featured),
    profileUrl: mediaUrl(w.profile_media, w.profile_url ?? null),
  }));
}

// ─── NEWS ────────────────────────────────────────────────────────────────────

export async function fetchNews(): Promise<any[]> {
  const { data, error } = await supabase
    .from("news_articles")
    .select(`id, title, arabic_title, slug, excerpt, arabic_excerpt, category, published_at, cover_media:cover_media_id ( secure_url, alt_text )`)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return (data ?? []).map((n: any) => ({
    id: n.id, title: n.title, arabicTitle: n.arabic_title, slug: n.slug,
    excerpt: n.excerpt, arabicExcerpt: n.arabic_excerpt, category: n.category,
    publishedAt: n.published_at, coverUrl: mediaUrl(n.cover_media, null),
  }));
}

// ─── USER PROFILE ────────────────────────────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<any | null> {
  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return data;
}

export async function fetchNovelBySlug(slug: string, preview = false): Promise<any | null> {
  let { data: novel, error } = await supabase
    .from("novels")
    .select("*")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();

  if (error || !novel) return null;

  const { data: dbChapters } = await supabase
    .from("novel_chapters")
    .select("*")
    .eq("novel_id", novel.id)
    .order("chapter_number", { ascending: true });

  let chapters = (dbChapters || []).map((c: any) => ({
    id: c.id,
    novelId: c.novel_id,
    chapterNumber: c.chapter_number,
    title: c.title,
    arabicTitle: c.arabic_title || c.title,
    summary: c.summary,
    arabicSummary: c.arabic_summary,
    wordCount: c.word_count || 1500,
    isPremium: Boolean(c.is_premium),
    accessLevel: c.is_premium ? "subscriber" : "public",
    publishedAt: c.created_at,
  }));

  if (chapters.length === 0) {
    const count = novel.total_chapters || 6;
    chapters = Array.from({ length: count }, (_, i) => ({
      id: `${novel.id}-ch-${i + 1}`,
      novelId: novel.id,
      chapterNumber: i + 1,
      title: `Chapter ${i + 1}`,
      arabicTitle: `الفصل ${i + 1}`,
      summary: `Chapter ${i + 1} of ${novel.arabic_title || novel.title}`,
      arabicSummary: `الفصل ${i + 1} من ${novel.arabic_title || novel.title}`,
      wordCount: 2200,
      isPremium: i > 1,
      accessLevel: i > 1 ? "subscriber" : "public",
      publishedAt: novel.created_at,
    }));
  }

  return {
    id: novel.id,
    slug: novel.slug,
    title: novel.title,
    arabicTitle: novel.arabic_title || novel.title,
    authorName: novel.author_name || "Hekayaty Studios",
    arabicAuthorName: novel.arabic_author_name || novel.author_name || "استوديو حكاياتي",
    summary: novel.summary,
    arabicSummary: novel.arabic_summary || novel.summary,
    coverUrl: novel.cover_url || null,
    bannerUrl: novel.banner_url || null,
    status: novel.status || "published",
    isPremium: Boolean(novel.is_premium),
    totalChapters: novel.total_chapters || chapters.length,
    rating: novel.rating || "4.9",
    tagline: novel.tagline,
    arabicTagline: novel.arabic_tagline,
    createdAt: novel.created_at,
    chapters,
  };
}

export async function fetchNovelChapter(chapterId: string): Promise<any | null> {
  const { data: dbChapter } = await supabase
    .from("novel_chapters")
    .select("*, novel:novel_id ( id, title, arabic_title, slug, author_name, arabic_author_name )")
    .eq("id", chapterId)
    .maybeSingle();

  if (dbChapter) {
    return {
      id: dbChapter.id,
      novelId: dbChapter.novel_id,
      novelSlug: (dbChapter.novel as any)?.slug || "novel",
      novelTitle: (dbChapter.novel as any)?.title,
      arabicNovelTitle: (dbChapter.novel as any)?.arabic_title,
      chapterNumber: dbChapter.chapter_number,
      title: dbChapter.title,
      arabicTitle: dbChapter.arabic_title || dbChapter.title,
      content: dbChapter.content || dbChapter.arabic_content || "محتوى الفصل غير متوفر حالياً.",
      arabicContent: dbChapter.arabic_content || dbChapter.content || "محتوى الفصل غير متوفر حالياً.",
      wordCount: dbChapter.word_count || 1800,
      isPremium: Boolean(dbChapter.is_premium),
      nextChapterId: dbChapter.next_chapter_id || null,
      prevChapterId: dbChapter.prev_chapter_id || null,
    };
  }

  // Fallback pattern if dynamically generated chapter ID (e.g., "id-ch-1")
  const parts = chapterId.split("-ch-");
  const novelId = parts[0];
  const chapterNum = parseInt(parts[1] || "1", 10);

  const { data: novel } = await supabase.from("novels").select("*").eq("id", novelId).maybeSingle();
  const novelTitle = novel?.arabic_title || novel?.title || "حكايات ميتوس";

  return {
    id: chapterId,
    novelId: novelId,
    novelSlug: novel?.slug || novelId,
    novelTitle: novel?.title || "Novel",
    arabicNovelTitle: novelTitle,
    chapterNumber: chapterNum,
    title: `Chapter ${chapterNum}`,
    arabicTitle: `الفصل ${chapterNum}`,
    content: `في أعماق عالم ${novelTitle}، بدأت الأساطير تروي حكاية لم يُسمع بها من قبل...`,
    arabicContent: `في أعماق عالم ${novelTitle}، بدأت الأساطير تروي حكاية لم يُسمع بها من قبل. كانت النجوم تضيء السماء الأرجوانية بأشعة سحرية خافتة.`,
    wordCount: 2100,
    isPremium: chapterNum > 2,
    nextChapterId: `${novelId}-ch-${chapterNum + 1}`,
    prevChapterId: chapterNum > 1 ? `${novelId}-ch-${chapterNum - 1}` : null,
  };
}

export async function fetchOriginalBySlug(slug: string): Promise<any | null> {
  const { data: original } = await supabase
    .from("originals")
    .select("*, cover_media:cover_media_id ( secure_url ), banner_media:banner_media_id ( secure_url )")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .maybeSingle();

  if (original) {
    return {
      id: original.id,
      title: original.title,
      arabicTitle: original.arabic_title || original.title,
      slug: original.slug,
      tagline: original.tagline || "",
      description: original.description || "",
      arabicDescription: original.arabic_description || original.description || "",
      contentType: original.content_type || "story",
      accessLevel: original.access_level || "subscriber",
      status: original.status || "published",
      creatorName: original.creator_name || "Hekayaty Studios",
      coverUrl: mediaUrl(original.cover_media, original.cover_url ?? null),
      bannerUrl: mediaUrl(original.banner_media, original.banner_url ?? null),
      releaseDate: original.release_date,
    };
  }

  // Fallback to novels if not found in originals
  const { data: novel } = await supabase.from("novels").select("*").or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle();
  if (novel) {
    return {
      id: novel.id,
      title: novel.title,
      arabicTitle: novel.arabic_title || novel.title,
      slug: novel.slug,
      tagline: novel.arabic_tagline || novel.tagline || "إنتاج خاص من حكاياتي",
      description: novel.summary || "",
      arabicDescription: novel.arabic_summary || novel.summary || "",
      contentType: "Novel",
      accessLevel: novel.is_premium ? "subscriber" : "public",
      status: "published",
      creatorName: novel.arabic_author_name || novel.author_name || "استوديو حكاياتي",
      coverUrl: novel.cover_url || null,
      bannerUrl: novel.banner_url || novel.cover_url || null,
      releaseDate: novel.created_at,
    };
  }

  return null;
}

export async function fetchWriterBySlug(slugOrId: string): Promise<any | null> {
  const { data: writer } = await supabase
    .from("writers")
    .select("*, profile_media:profile_media_id ( secure_url )")
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId},pen_name.eq.${slugOrId}`)
    .maybeSingle();

  if (!writer) return null;

  const [postsRes, qRes] = await Promise.all([
    supabase.from("writer_posts").select("*").eq("writer_id", writer.id).order("created_at", { ascending: false }),
    supabase.from("writer_questions").select("*").eq("writer_id", writer.id).order("created_at", { ascending: false }),
  ]);

  return {
    id: writer.id,
    penName: writer.pen_name,
    arabicPenName: writer.arabic_pen_name || writer.pen_name,
    slug: writer.slug || writer.id,
    bio: writer.bio,
    arabicBio: writer.arabic_bio || writer.bio,
    specialty: writer.specialty || "كاتب و مؤلف سحرية",
    socialLinks: writer.social_links || {},
    profileUrl: mediaUrl(writer.profile_media, writer.profile_url ?? null),
    posts: (postsRes.data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      arabicContent: p.arabic_content || p.content,
      likesCount: p.likes_count || 0,
      commentsCount: p.comments_count || 0,
      createdAt: p.created_at,
    })),
    questions: (qRes.data || []).map((q: any) => ({
      id: q.id,
      question: q.question_text,
      answer: q.answer_text,
      isAnswered: Boolean(q.answer_text),
      askedBy: q.user_name || "متابع حكاياتي",
      createdAt: q.created_at,
    })),
  };
}

export async function fetchStories(): Promise<any[]> {
  const { data: dbNovels } = await supabase.from("novels").select("*").order("created_at", { ascending: false });

  return (dbNovels || []).map((n: any) => ({
    id: n.id,
    title: n.title,
    arabicTitle: n.arabic_title || n.title,
    slug: n.slug,
    author: n.arabic_author_name || n.author_name || "حكاياتي",
    summary: n.arabic_summary || n.summary,
    coverUrl: n.cover_url,
    totalChapters: n.total_chapters || 12,
  }));
}

export async function fetchStoreProducts(): Promise<any[]> {
  const { data: products } = await supabase.from("store_products").select("*");
  if (products && products.length > 0) return products;

  return [
    {
      id: "prod-1",
      name: "Mythos Chronicles Vol. 1 - Deluxe Hardcover",
      arabicName: "سجلات ميتوس - المجلد الأول (طبعة فاخرة)",
      price: 29.99,
      currency: "USD",
      category: "Books",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      description: "Hardcover physical edition featuring high-resolution artwork and extra lore notes.",
      inStock: true,
    },
    {
      id: "prod-2",
      name: "Feather of Mythos Collector Pin",
      arabicName: "دبوس ريشة ميتوس الذهبية للمجمعين",
      price: 14.99,
      currency: "USD",
      category: "Merch",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      description: "Gold-plated enamel pin with cinematic metallic glow.",
      inStock: true,
    }
  ];
}

export async function fetchUserLibrary(userId: string): Promise<any[]> {
  const { data } = await supabase
    .from("user_library")
    .select("*, novel:novel_id (*), comic:comic_id (*)")
    .eq("user_id", userId);

  return (data || []).map((item: any) => ({
    id: item.id,
    targetId: item.novel_id || item.comic_id,
    itemType: item.novel_id ? "novel" : "comic",
    title: item.novel?.arabic_title || item.comic?.arabic_title || item.novel?.title || item.comic?.title,
    coverUrl: item.novel?.cover_url || item.comic?.cover_url,
    addedAt: item.created_at,
  }));
}

export async function fetchSubscriptionPlans(): Promise<any[]> {
  return [
    {
      id: "plan-monthly",
      name: "Mythos Explorer (Monthly)",
      arabicName: "مستكشف ميتوس (شهري)",
      price: "$4.99",
      period: "/month",
      features: [
        "إمكانية قراءة جميع الكوميكس الحصرية",
        "الوصول المبكر للفصول القادمة",
        "شارات خاصة في المنتدى والملف الشخصي",
        "تحميل الفصول للقراءة دون اتصال"
      ],
      isPopular: true,
    },
    {
      id: "plan-yearly",
      name: "Mythos Master (Yearly)",
      arabicName: "سيد ميتوس (سنوي)",
      price: "$44.99",
      period: "/year",
      features: [
        "جميع مزايا اشتراك المستكشف الشهري",
        "خصم 25% على اشتراك السنة كاملة",
        "دبوس ريشة ميتوس الرقمي المميز",
        "دخول حصري لأحداث أسئلة وأجوبة مع الكتاب"
      ],
      isPopular: false,
    }
  ];
}

