import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const storeProductsTable = pgTable("store_products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  category: text("category").notNull(), // 'book', 'comic', 'card_pack', 'merch', 'digital'
  description: text("description").notNull(),
  arabicDescription: text("arabic_description").notNull(),
  priceEgp: integer("price_egp").notNull(),
  originalPriceEgp: integer("original_price_egp"),
  imageUrl: text("image_url").notNull(),
  inStock: boolean("in_stock").default(true).notNull(),
  isExclusive: boolean("is_exclusive").default(false).notNull(),
  rating: text("rating").default("5.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
