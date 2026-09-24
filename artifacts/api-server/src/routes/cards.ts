import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/cards", async (_req: Request, res: Response) => {
  try {
    const { data: dbCards, error } = await supabase.from("card_game_cards").select("*");
    if (error) {
      // Fallback try table name "cards" if card_game_cards isn't mapped
      const { data: altCards } = await supabase.from("cards").select("*");
      if (altCards) {
        const formatted = altCards.map((c: any) => ({
          id: c.id,
          cardCode: c.card_code || "HEK-000",
          name: c.name,
          arabicName: c.arabic_name || c.name,
          rarity: c.rarity,
          element: c.element,
          attack: c.attack,
          defense: c.defense,
          magic: c.magic,
          imageUrl: c.image_url,
          flavorText: c.flavor_text,
          arabicFlavorText: c.arabic_flavor_text || c.flavor_text,
        }));
        res.json(formatted);
        return;
      }
      console.error("Error fetching cards from Supabase:", error.message);
      return res.status(500).json({ error: "Failed to fetch cards" });
    }

    const formatted = (dbCards || []).map((c: any) => ({
      id: c.id,
      cardCode: c.card_code || "HEK-000",
      name: c.name,
      arabicName: c.arabic_name || c.name,
      rarity: c.rarity,
      element: c.element,
      attack: c.attack,
      defense: c.defense,
      magic: c.magic,
      imageUrl: c.image_url,
      flavorText: c.flavor_text,
      arabicFlavorText: c.arabic_flavor_text || c.flavor_text,
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.get("/cards/:id", async (req: Request, res: Response) => {
  try {
    let { data: c, error } = await supabase.from("card_game_cards").select("*").or(`id.eq.${req.params.id},card_code.eq.${req.params.id}`).single();
    if (error || !c) {
      const { data: altC } = await supabase.from("cards").select("*").or(`id.eq.${req.params.id},card_code.eq.${req.params.id}`).single();
      c = altC;
    }

    if (!c) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json({
      id: c.id,
      cardCode: c.card_code || "HEK-000",
      name: c.name,
      arabicName: c.arabic_name || c.name,
      rarity: c.rarity,
      element: c.element,
      attack: c.attack,
      defense: c.defense,
      magic: c.magic,
      imageUrl: c.image_url,
      flavorText: c.flavor_text,
      arabicFlavorText: c.arabic_flavor_text || c.flavor_text,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
