import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ============================================================================
// Centralized Media Table (Cloudinary)
// All images/assets across the platform reference this table.
// ============================================================================
export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull(), // Cloudinary public_id
  secureUrl: text("secure_url").notNull(), // Cloudinary secure_url
  width: integer("width"),
  height: integer("height"),
  format: text("format"), // jpg, png, webp, etc.
  resourceType: text("resource_type").default("image"), // image, video, raw
  category: text("category").notNull(), // portrait, cover, page, landscape, poster, icon
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;
