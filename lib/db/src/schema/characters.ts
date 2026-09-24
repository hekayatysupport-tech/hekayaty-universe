import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { media } from "./media";
import { userProfiles } from "./users";
import { contentStatusEnum } from "./common";

// ============================================================================
// Enums
// ============================================================================
export const alignmentEnum = pgEnum("alignment", ["Hero", "Villain", "Antihero", "Neutral"]);
export const characterStatusEnum = pgEnum("character_status", ["Active", "Deceased", "Unknown", "Imprisoned"]);

// ============================================================================
// Characters
// ============================================================================
export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  alias: text("alias"),
  title: text("title"),
  quote: text("quote"),
  alignment: alignmentEnum("alignment").notNull().default("Hero"),
  characterStatus: characterStatusEnum("character_status").notNull().default("Active"),
  powerCategory: text("power_category"),
  organization: text("organization"),
  shortBio: text("short_bio"),
  fullBio: text("full_bio"),
  aboutText: text("about_text"),
  portraitMediaId: uuid("portrait_media_id").references(() => media.id),
  // Auth & Workflow
  status: contentStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => userProfiles.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Character Stats (1:1 with character)
// ============================================================================
export const characterStats = pgTable("character_stats", {
  characterId: uuid("character_id").primaryKey().references(() => characters.id, { onDelete: "cascade" }),
  strength: integer("strength").notNull().default(0),
  speed: integer("speed").notNull().default(0),
  intelligence: integer("intelligence").notNull().default(0),
  wisdom: integer("wisdom").notNull().default(0),
  willpower: integer("willpower").notNull().default(0),
  magic: integer("magic").notNull().default(0),
});

// ============================================================================
// Character Abilities (1:N)
// ============================================================================
export const characterAbilities = pgTable("character_abilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
});

// ============================================================================
// Character Relationships (M:N self-referencing)
// ============================================================================
export const characterRelationships = pgTable("character_relationships", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterAId: uuid("character_a_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  characterBId: uuid("character_b_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  relationType: text("relation_type").notNull(), // Ally, Enemy, Mentor, Rival, Family
  description: text("description"),
});

// ============================================================================
// Character Gallery (M:N with media)
// ============================================================================
export const characterGallery = pgTable("character_gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
});

// ============================================================================
// Relations (Drizzle relational query helpers)
// ============================================================================
export const charactersRelations = relations(characters, ({ one, many }) => ({
  portrait: one(media, { fields: [characters.portraitMediaId], references: [media.id] }),
  stats: one(characterStats, { fields: [characters.id], references: [characterStats.characterId] }),
  abilities: many(characterAbilities),
  relationshipsAsA: many(characterRelationships, { relationName: "characterA" }),
  relationshipsAsB: many(characterRelationships, { relationName: "characterB" }),
  gallery: many(characterGallery),
}));

export const characterStatsRelations = relations(characterStats, ({ one }) => ({
  character: one(characters, { fields: [characterStats.characterId], references: [characters.id] }),
}));

export const characterAbilitiesRelations = relations(characterAbilities, ({ one }) => ({
  character: one(characters, { fields: [characterAbilities.characterId], references: [characters.id] }),
}));

export const characterRelationshipsRelations = relations(characterRelationships, ({ one }) => ({
  characterA: one(characters, { fields: [characterRelationships.characterAId], references: [characters.id], relationName: "characterA" }),
  characterB: one(characters, { fields: [characterRelationships.characterBId], references: [characters.id], relationName: "characterB" }),
}));

export const characterGalleryRelations = relations(characterGallery, ({ one }) => ({
  character: one(characters, { fields: [characterGallery.characterId], references: [characters.id] }),
  media: one(media, { fields: [characterGallery.mediaId], references: [media.id] }),
}));

// ============================================================================
// Zod Schemas & Types
// ============================================================================
export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export const insertCharacterStatsSchema = createInsertSchema(characterStats);
export type InsertCharacterStats = z.infer<typeof insertCharacterStatsSchema>;

export const insertCharacterAbilitySchema = createInsertSchema(characterAbilities).omit({ id: true });
export type InsertCharacterAbility = z.infer<typeof insertCharacterAbilitySchema>;

export const insertCharacterRelationshipSchema = createInsertSchema(characterRelationships).omit({ id: true });
export type InsertCharacterRelationship = z.infer<typeof insertCharacterRelationshipSchema>;
