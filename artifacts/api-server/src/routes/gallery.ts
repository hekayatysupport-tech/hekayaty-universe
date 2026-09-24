import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/gallery
 * Returns all media entries, optionally filtered by ?category=
 */
router.get("/gallery", async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;

  let query = supabase
    .from("media")
    .select("id, public_id, secure_url, width, height, format, resource_type, category, alt_text, created_at")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching gallery:", error.message);
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.json((data ?? []).map((m: any) => ({
    id: m.id,
    publicId: m.public_id,
    secureUrl: m.secure_url,
    width: m.width,
    height: m.height,
    format: m.format,
    resourceType: m.resource_type,
    category: m.category,
    altText: m.alt_text,
    createdAt: m.created_at,
  })));
});

/**
 * POST /api/upload
 * Uploads to Cloudinary and saves to media table via Supabase.
 * Requires cloudinary package: pnpm add cloudinary --filter @workspace/api-server
 */
router.post("/upload", async (req, res): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { v2: cloudinary } = await import("cloudinary" as any);

    cloudinary.config({
      cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
      api_key: process.env["CLOUDINARY_API_KEY"],
      api_secret: process.env["CLOUDINARY_API_SECRET"],
    });

    if (!process.env["CLOUDINARY_CLOUD_NAME"]) {
      res.status(500).json({ error: "Cloudinary not configured." });
      return;
    }

    const { image, category, altText, folder } = req.body;
    if (!image) {
      res.status(400).json({ error: "Missing 'image' field." });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: folder || "hekayaty",
      resource_type: "auto",
    });

    const { data: mediaRecord, error: dbError } = await supabase
      .from("media")
      .insert({
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resource_type: uploadResult.resource_type,
        category: category || "landscape",
        alt_text: altText || null,
      })
      .select()
      .single();

    if (dbError) {
      res.status(500).json({ error: "Failed to save media record." });
      return;
    }

    res.json(mediaRecord);
  } catch (err) {
    console.error("Error uploading:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
