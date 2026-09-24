import { pgTable, uuid, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { media } from "./media";
import { characters } from "./characters";
import { worlds } from "./worlds";
import { userProfiles } from "./users";
import { contentStatusEnum } from "./common";

// ============================================================================
// Encyclopedia Categories Enum
// ============================================================================
export const encyclopediaCategoryEnum = pgEnum("encyclopedia_category", [
  "Artifact",
  "Power",
  "MagicSystem",
  "Faction",
  "Creature",
  "Concept",
  "Technology",
  "Mystery",
]);

// ============================================================================
// Encyclopedia Entries
// ============================================================================
export const encyclopediaEntries = pgTable("encyclopedia_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  category: encyclopediaCategoryEnum("category").notNull(),
  content: text("content"),
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
// Encyclopedia Tags
// ============================================================================
export const encyclopediaTags = pgTable("encyclopedia_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id").notNull().references(() => encyclopediaEntries.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

// ============================================================================
// Junction: Encyclopedia <-> Character
// ============================================================================
export const encyclopediaCharacters = pgTable("encyclopedia_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id").notNull().references(() => encyclopediaEntries.id, { onDelete: "cascade" }),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: Encyclopedia <-> World
// ============================================================================
export const encyclopediaWorlds = pgTable("encyclopedia_worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id").notNull().references(() => encyclopediaEntries.id, { onDelete: "cascade" }),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: Character <-> Artifact (via encyclopedia entries where category = Artifact)
// ============================================================================
export const characterArtifacts = pgTable("character_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  entryId: uuid("entry_id").notNull().references(() => encyclopediaEntries.id, { onDelete: "cascade" }),
});

// ============================================================================
// Relations
// ============================================================================
export const encyclopediaEntriesRelations = relations(encyclopediaEntries, ({ one, many }) => ({
  cover: one(media, { fields: [encyclopediaEntries.coverMediaId], references: [media.id] }),
  tags: many(encyclopediaTags),
  relatedCharacters: many(encyclopediaCharacters),
  relatedWorlds: many(encyclopediaWorlds),
  characterArtifacts: many(characterArtifacts),
}));

export const encyclopediaTagsRelations = relations(encyclopediaTags, ({ one }) => ({
  entry: one(encyclopediaEntries, { fields: [encyclopediaTags.entryId], references: [encyclopediaEntries.id] }),
}));

export const encyclopediaCharactersRelations = relations(encyclopediaCharacters, ({ one }) => ({
  entry: one(encyclopediaEntries, { fields: [encyclopediaCharacters.entryId], references: [encyclopediaEntries.id] }),
  character: one(characters, { fields: [encyclopediaCharacters.characterId], references: [characters.id] }),
}));

export const encyclopediaWorldsRelations = relations(encyclopediaWorlds, ({ one }) => ({
  entry: one(encyclopediaEntries, { fields: [encyclopediaWorlds.entryId], references: [encyclopediaEntries.id] }),
  world: one(worlds, { fields: [encyclopediaWorlds.worldId], references: [worlds.id] }),
}));

export const characterArtifactsRelations = relations(characterArtifacts, ({ one }) => ({
  character: one(characters, { fields: [characterArtifacts.characterId], references: [characters.id] }),
  entry: one(encyclopediaEntries, { fields: [characterArtifacts.entryId], references: [encyclopediaEntries.id] }),
}));

// ============================================================================
// Zod & Types
// ============================================================================
export const insertEncyclopediaEntrySchema = createInsertSchema(encyclopediaEntries).omit({ id: true, createdAt: true });
export type InsertEncyclopediaEntry = z.infer<typeof insertEncyclopediaEntrySchema>;
export type EncyclopediaEntry = typeof encyclopediaEntries.$inferSelect;
