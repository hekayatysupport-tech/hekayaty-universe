import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/store/products", async (_req: Request, res: Response) => {
  try {
    const { data: dbProducts, error } = await supabase.from("store_products").select("*");
    if (error) {
      console.error("Error fetching store products from Supabase:", error.message);
      return res.status(500).json({ error: "Failed to fetch store products" });
    }

    const formatted = (dbProducts || []).map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      arabicName: p.arabic_name || p.name,
      category: p.category,
      description: p.description,
      arabicDescription: p.arabic_description || p.description,
      priceEgp: p.price_egp,
      originalPriceEgp: p.original_price_egp,
      imageUrl: p.image_url,
      inStock: p.in_stock,
      isExclusive: p.is_exclusive,
      rating: p.rating || "5.0",
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.get("/store/products/:slug", async (req: Request, res: Response) => {
  try {
    const { data: p, error } = await supabase
      .from("store_products")
      .select("*")
      .or(`slug.eq.${req.params.slug},id.eq.${req.params.slug}`)
      .single();

    if (error || !p) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      id: p.id,
      slug: p.slug,
      name: p.name,
      arabicName: p.arabic_name || p.name,
      category: p.category,
      description: p.description,
      arabicDescription: p.arabic_description || p.description,
      priceEgp: p.price_egp,
      originalPriceEgp: p.original_price_egp,
      imageUrl: p.image_url,
      inStock: p.in_stock,
      isExclusive: p.is_exclusive,
      rating: p.rating || "5.0",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
