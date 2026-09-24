import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { media } from "./media";
import { characters } from "./characters";
import { userProfiles } from "./users";
import { contentStatusEnum } from "./common";

// ============================================================================
// Worlds
// ============================================================================
export const worlds = pgTable("worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  description: text("description"),
  coverMediaId: uuid("cover_media_id").references(() => media.id),
  
  // Auth & Workflow
  status: contentStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => userProfiles.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Regions (child of World)
// ============================================================================
export const regions = pgTable("regions", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  coverMediaId: uuid("cover_media_id").references(() => media.id),
});

// ============================================================================
// Locations (child of Region)
// ============================================================================
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  regionId: uuid("region_id").notNull().references(() => regions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  locationType: text("location_type"), // City, Temple, Mountain, Ruins, Forest, Sea
  coverMediaId: uuid("cover_media_id").references(() => media.id),
});

// ============================================================================
// Junction: Character <-> World
// ============================================================================
export const characterWorlds = pgTable("character_worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  relationship: text("relationship"), // Origin, Residence, Visited, Conquered
});

// ============================================================================
// World Gallery (M:N with media)
// ============================================================================
export const worldGallery = pgTable("world_gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
});

// ============================================================================
// Relations
// ============================================================================
export const worldsRelations = relations(worlds, ({ one, many }) => ({
  cover: one(media, { fields: [worlds.coverMediaId], references: [media.id] }),
  regions: many(regions),
  characterWorlds: many(characterWorlds),
  gallery: many(worldGallery),
}));

export const regionsRelations = relations(regions, ({ one, many }) => ({
  world: one(worlds, { fields: [regions.worldId], references: [worlds.id] }),
  cover: one(media, { fields: [regions.coverMediaId], references: [media.id] }),
  locations: many(locations),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  region: one(regions, { fields: [locations.regionId], references: [regions.id] }),
  cover: one(media, { fields: [locations.coverMediaId], references: [media.id] }),
}));

export const characterWorldsRelations = relations(characterWorlds, ({ one }) => ({
  character: one(characters, { fields: [characterWorlds.characterId], references: [characters.id] }),
  world: one(worlds, { fields: [characterWorlds.worldId], references: [worlds.id] }),
}));

export const worldGalleryRelations = relations(worldGallery, ({ one }) => ({
  world: one(worlds, { fields: [worldGallery.worldId], references: [worlds.id] }),
  media: one(media, { fields: [worldGallery.mediaId], references: [media.id] }),
}));

// ============================================================================
// Zod & Types
// ============================================================================
export const insertWorldSchema = createInsertSchema(worlds).omit({ id: true, createdAt: true });
export type InsertWorld = z.infer<typeof insertWorldSchema>;
export type World = typeof worlds.$inferSelect;

export const insertRegionSchema = createInsertSchema(regions).omit({ id: true });
export type InsertRegion = z.infer<typeof insertRegionSchema>;

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
