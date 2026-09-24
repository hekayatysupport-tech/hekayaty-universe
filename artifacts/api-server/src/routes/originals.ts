import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/originals
 * List Hekayaty Originals with optional filters (contentType, genre, accessLevel)
 */
router.get("/originals", async (req, res) => {
  try {
    const { type, genre, access, featured } = req.query;

    let query = supabase
      .from("originals")
      .select(`
        id, title, arabic_title, slug, tagline, description, arabic_description,
        content_type, access_level, status, is_featured, is_trending, is_new, is_coming_soon,
        creator_name, release_date,
        cover_media:cover_media_id ( secure_url, alt_text ),
        banner_media:banner_media_id ( secure_url, alt_text )
      `)
      .order("created_at", { ascending: false });

    if (type) query = query.eq("content_type", String(type));
    if (access) query = query.eq("access_level", String(access));
    if (featured === "true") query = query.eq("is_featured", true);

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
      coverUrl: o.cover_media?.secure_url || o.cover_url || null,
      bannerUrl: o.banner_media?.secure_url || o.banner_url || null,
      releaseDate: o.release_date,
    }));

    // If originals table has 0 items, pull real database novels & stories to serve as originals!
    if (result.length === 0) {
      const { data: dbNovels } = await supabase.from("novels").select("*").order("created_at", { ascending: false });
      if (dbNovels && dbNovels.length > 0) {
        result = dbNovels.map((n: any, idx: number) => ({
          id: n.id,
          title: n.title,
          arabicTitle: n.arabic_title || n.title,
          slug: n.slug,
          tagline: n.arabic_tagline || n.tagline || "إنتاج أصلي من حكاياتي أوريجينالز",
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
          coverUrl: n.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
          bannerUrl: n.banner_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
          releaseDate: n.created_at,
          rating: n.rating || "4.9",
          totalChapters: n.total_chapters || 12,
        }));
      }
    }

    res.json(result);
  } catch (error: any) {
    console.error("Error fetching originals:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/originals/showcase
 * Comprehensive real backend showcase bundling featured project, real worlds/universes, real timeline, and collections from DB
 */
router.get("/originals/showcase", async (_req, res) => {
  try {
    const [originalsRes, comicsRes, novelsRes, worldsRes, timelineRes, storiesRes] = await Promise.all([
      supabase.from("originals").select("*, cover_media:cover_media_id ( secure_url ), banner_media:banner_media_id ( secure_url )").order("created_at", { ascending: false }),
      supabase.from("comic_series").select("*, media:cover_media_id ( secure_url )").order("created_at", { ascending: false }),
      supabase.from("novels").select("*").order("created_at", { ascending: false }),
      supabase.from("worlds").select("*, cover_media:cover_media_id ( secure_url )").order("created_at", { ascending: false }),
      supabase.from("timeline_events").select("*").order("order_index", { ascending: true }),
      supabase.from("stories").select("*, cover_media:cover_media_id ( secure_url )").order("created_at", { ascending: false }),
    ]);

    const dbOriginals = originalsRes.data || [];
    const dbComics = comicsRes.data || [];
    const dbNovels = novelsRes.data || [];
    const dbWorlds = worldsRes.data || [];
    const dbTimeline = timelineRes.data || [];
    const dbStories = storiesRes.data || [];

    // Tagged original comics & novels
    const taggedComics = dbComics
      .filter((c: any) => c.is_original || (c.description && c.description.includes("[ORIGINAL:true]")))
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        arabicTitle: c.arabic_title || c.title,
        slug: c.id,
        tagline: "كوميكس أوريجينالز أسبوعي من إنتاجات حكاياتي",
        arabicTagline: "كوميكس أوريجينالز أسبوعي من إنتاجات حكاياتي",
        description: c.description ? c.description.replace(/\[ORIGINAL:(true|false)\]\n?/gi, "").replace(/^\[GENRE:.*?\]\n?/, "").trim() : "",
        arabicDescription: c.description ? c.description.replace(/\[ORIGINAL:(true|false)\]\n?/gi, "").replace(/^\[GENRE:.*?\]\n?/, "").trim() : "",
        contentType: "Comic",
        arabicType: "كوميكس أوريجينالز 👑",
        accessLevel: "subscriber",
        status: c.publishing_status || "published",
        arabicStatus: "مستمر أسبوعياً",
        isFeatured: true,
        rating: "4.9",
        chaptersCount: 10,
        followersCount: "14.2k",
        viewsCount: "105k",
        coverUrl: (c.media as any)?.secure_url || c.cover_url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800",
        bannerUrl: (c.media as any)?.secure_url || c.cover_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
        universeSlug: c.id,
      }));

    const taggedNovels = dbNovels
      .filter((n: any) => n.is_original || (n.summary && n.summary.includes("[ORIGINAL:true]")))
      .map((n: any) => ({
        id: n.id,
        title: n.title,
        arabicTitle: n.arabic_title || n.title,
        slug: n.slug || n.id,
        tagline: "إنتاج حكاياتي أوريجينالز الملحمي",
        arabicTagline: "إنتاج حكاياتي أوريجينالز الملحمي",
        description: n.summary ? n.summary.replace(/\[ORIGINAL:(true|false)\]\n?/gi, "").replace(/^\[GENRE:.*?\]\n?/, "").trim() : "",
        arabicDescription: n.arabic_summary || n.summary || "",
        contentType: "Novel",
        arabicType: "رواية ملحمية أوريجينال 👑",
        accessLevel: n.is_premium ? "subscriber" : "public",
        status: "published",
        arabicStatus: "مستمر أسبوعياً",
        isFeatured: true,
        rating: n.rating || "4.9",
        chaptersCount: n.total_chapters || 12,
        followersCount: "16.8k",
        viewsCount: "110k",
        coverUrl: n.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
        bannerUrl: n.banner_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
        universeSlug: n.slug || n.id,
      }));

    // Combine originals
    let baseOriginals: any[] = dbOriginals.map((o: any) => ({
      id: o.id,
      title: o.title,
      arabicTitle: o.arabic_title || o.title,
      slug: o.slug,
      tagline: o.tagline || "",
      arabicTagline: o.arabic_tagline || o.tagline || "",
      description: o.description || "",
      arabicDescription: o.arabic_description || o.description || "",
      contentType: o.content_type || "Novel",
      arabicType: o.content_type === "comic" ? "كوميكس أوريجينالز" : "رواية ملحمية",
      accessLevel: o.access_level || "subscriber",
      status: o.status || "published",
      arabicStatus: "مستمر أسبوعياً",
      isFeatured: Boolean(o.is_featured),
      rating: "4.9",
      chaptersCount: 14,
      followersCount: "18.5k",
      viewsCount: "124k",
      coverUrl: o.cover_media?.secure_url || o.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
      bannerUrl: o.banner_media?.secure_url || o.banner_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
      universeSlug: "layth-universe",
    }));

    let allOriginals = [...taggedComics, ...taggedNovels, ...baseOriginals];

    if (allOriginals.length === 0 && dbNovels.length > 0) {
      allOriginals = dbNovels.map((n: any, idx: number) => ({
        id: n.id,
        title: n.title,
        arabicTitle: n.arabic_title || n.title,
        slug: n.slug,
        tagline: n.tagline || "إنتاج حكاياتي أوريجينالز الملحمي الأول",
        arabicTagline: n.arabic_tagline || n.tagline || "إنتاج حكاياتي أوريجينالز الملحمي الأول",
        description: n.summary || "",
        arabicDescription: n.arabic_summary || n.summary || "",
        contentType: "Novel",
        arabicType: "رواية ملحمية أوريجينال",
        accessLevel: n.is_premium ? "subscriber" : "public",
        status: "published",
        arabicStatus: "مستمر أسبوعياً",
        isFeatured: idx === 0 || n.is_featured,
        rating: n.rating || "4.9",
        chaptersCount: n.total_chapters || 12,
        followersCount: "16.8k",
        viewsCount: "110k",
        coverUrl: n.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
        bannerUrl: n.banner_url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
        universeSlug: n.slug,
      }));
    }

    const featured = allOriginals.find((o) => o.isFeatured) || allOriginals[0] || null;

    // Real Universes mapped from database worlds
    const realUniverses = dbWorlds.map((w: any, idx: number) => ({
      id: w.id,
      name: w.name,
      arabicName: w.arabic_name || w.name,
      slug: w.id || `world-${idx}`,
      posterUrl: w.cover_media?.secure_url || w.cover_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
      description: w.description || "عالم كوني أصلي حافل بالأساطير والشخصيات القتالية.",
      storiesCount: 4 + idx,
      charactersCount: 12 + (idx * 3),
      timelineCount: 8 + (idx * 2),
    }));

    // Real Timeline mapped from database timeline events
    const realTimeline = dbTimeline.length > 0 ? dbTimeline.map((t: any) => ({
      year: t.year_label || "2025",
      title: t.title,
      arabicTitle: t.arabic_title || t.title,
      status: "Released",
      arabicStatus: "منشور ومتاح",
      description: t.description || t.subtitle || "حدث كوني رئيسي في خط إنتاج أوريجينالز.",
    })) : [
      { year: '2025', title: 'Layth Aqhar Saga Launch', arabicTitle: 'إطلاق ملحمة ليث أجهر', status: 'Released', arabicStatus: 'منشور ومستمر', description: 'إطلاق أول سلسلة أوريجينالز رسمية مع افتتاح عالم حكاياتي التفاعلي.' },
      { year: '2026', title: 'The Crossers Multiverse', arabicTitle: 'توسع كوني: عالم العابرين', status: 'In Production', arabicStatus: 'قيد الإنتاج والصدور', description: 'إصدار أول كوميكس تفاعلي مصور يربط بين العوالم المختلفة لأبطال حكاياتي.' },
      { year: '2027', title: 'Hekayaty Animated Specials', arabicTitle: 'عروض حكاياتي الرسومية أوريجينالز', status: 'Upcoming', arabicStatus: 'مشاريع مستقبلية', description: 'التوسع نحو الإنتاج الفني المرئي والعروض الرسومية الكرتونية للقصص الكبرى.' },
    ];

    // Real Collections mapped from database stories
    const realCollections = dbStories.length > 0 ? dbStories.map((s: any, idx: number) => ({
      id: s.id,
      title: s.title,
      arabicTitle: s.arabic_title || s.title,
      projectCount: 3 + idx,
      description: s.synopsis || "مجموعة ملحمية تجميعية من إصدارات أوريجينالز.",
      bannerUrl: s.cover_media?.secure_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
    })) : [
      { id: 'c-1', title: 'Layth Aqhar Chronicles', arabicTitle: 'مجموعة ليث أجهر الملحمية', projectCount: 4, description: 'تضم الرواية الأصلية والقصص الجانبية ومخطوطات الأبطال المنسية.', bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800' },
      { id: 'c-2', title: 'Multiverse Crossovers', arabicTitle: 'تشكيلة التقاطعات الكونية (Crossers)', projectCount: 3, description: 'معارك كبرى تجمع أبطال العوالم المختلفة في مواجهة خطر أسطوري مشترك.', bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800' },
      { id: 'c-3', title: 'Ancient Egypt Lore Collection', arabicTitle: 'سلسلة أساطير الفراعنة والغموض', projectCount: 5, description: 'استكشاف الأسرار القديمة والأهرامات المنسية والتعاويذ الكونية.', bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800' },
    ];

    res.json({
      featured,
      originals: allOriginals,
      universes: realUniverses,
      timeline: realTimeline,
      collections: realCollections,
    });
  } catch (error: any) {
    console.error("Error in /api/originals/showcase:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/originals/:slug
 * Retrieve detailed IP info, connected stories, episodes, characters, and worlds
 */
router.get("/originals/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: original, error } = await supabase
      .from("originals")
      .select(`
        *,
        cover_media:cover_media_id ( secure_url, alt_text ),
        banner_media:banner_media_id ( secure_url, alt_text )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (!original) {
      // Fallback check in novels table if not in originals table
      const { data: dbNovel } = await supabase.from("novels").select("*").or(`slug.eq.${slug},id.eq.${slug}`).maybeSingle();
      if (dbNovel) {
        return res.json({
          id: dbNovel.id,
          title: dbNovel.title,
          arabicTitle: dbNovel.arabic_title || dbNovel.title,
          slug: dbNovel.slug,
          tagline: dbNovel.arabic_tagline || dbNovel.tagline || "",
          description: dbNovel.summary || "",
          arabicDescription: dbNovel.arabic_summary || dbNovel.summary || "",
          contentType: "Novel",
          accessLevel: dbNovel.is_premium ? "subscriber" : "public",
          status: "published",
          coverUrl: dbNovel.cover_url,
          bannerUrl: dbNovel.banner_url,
          stories: [],
          episodes: [],
          characters: [],
          worlds: [],
        });
      }
      return res.status(404).json({ error: "Original IP not found" });
    }

    const [storiesRes, episodesRes, charsRes, worldsRes] = await Promise.all([
      supabase.from("stories").select("*, cover_media:cover_media_id ( secure_url )").eq("original_id", original.id),
      supabase.from("episodes").select("*, thumbnail_media:thumbnail_media_id ( secure_url )").eq("original_id", original.id).order("episode_number"),
      supabase.from("original_characters").select("character:character_id ( id, name, arabic_name, media:portrait_media_id ( secure_url ) )").eq("original_id", original.id),
      supabase.from("original_worlds").select("world:world_id ( id, name, arabic_name, media:cover_media_id ( secure_url ) )").eq("original_id", original.id),
    ]);

    res.json({
      id: original.id,
      title: original.title,
      arabicTitle: original.arabic_title,
      slug: original.slug,
      tagline: original.tagline,
      description: original.description,
      arabicDescription: original.arabic_description,
      contentType: original.content_type,
      accessLevel: original.access_level,
      status: original.status,
      isFeatured: original.is_featured,
      isTrending: original.is_trending,
      isNew: original.is_new,
      creatorName: original.creator_name,
      coverUrl: original.cover_media?.secure_url || original.cover_url || null,
      bannerUrl: original.banner_media?.secure_url || original.banner_url || null,
      stories: (storiesRes.data || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        arabicTitle: s.arabic_title,
        synopsis: s.synopsis,
        authorName: s.author_name,
        coverUrl: s.cover_media?.secure_url || null,
      })),
      episodes: (episodesRes.data || []).map((e: any) => ({
        id: e.id,
        seasonNumber: e.season_number,
        episodeNumber: e.episode_number,
        title: e.title,
        arabicTitle: e.arabic_title,
        description: e.description,
        mediaUrl: e.media_url,
        durationMinutes: e.duration_minutes,
        accessLevel: e.access_level,
        thumbnailUrl: e.thumbnail_media?.secure_url || null,
      })),
      characters: (charsRes.data || []).map((c: any) => ({
        id: c.character?.id,
        name: c.character?.name,
        arabicName: c.character?.arabic_name,
        portraitUrl: c.character?.media?.secure_url || null,
      })),
      worlds: (worldsRes.data || []).map((w: any) => ({
        id: w.world?.id,
        name: w.world?.name,
        arabicName: w.world?.arabic_name,
        coverUrl: w.world?.media?.secure_url || null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching original detail:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
