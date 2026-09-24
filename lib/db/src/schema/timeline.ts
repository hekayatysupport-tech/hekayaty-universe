import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { characters } from "./characters";
import { worlds } from "./worlds";
import { comicIssues } from "./comics";
import { encyclopediaEntries } from "./encyclopedia";
import { userProfiles } from "./users";
import { contentStatusEnum } from "./common";

// ============================================================================
// Timeline Eras (ordered groupings of events)
// ============================================================================
export const timelineEras = pgTable("timeline_eras", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
});

// ============================================================================
// Timeline Events
// ============================================================================
export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eraId: uuid("era_id").references(() => timelineEras.id, { onDelete: "set null" }),
  yearLabel: text("year_label").notNull(), // e.g. "1001", "Before Known Time"
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  subtitle: text("subtitle"),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  
  // Auth & Workflow
  status: contentStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => userProfiles.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Junction: Event <-> Character
// ============================================================================
export const timelineEventCharacters = pgTable("timeline_event_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => timelineEvents.id, { onDelete: "cascade" }),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: Event <-> World
// ============================================================================
export const timelineEventWorlds = pgTable("timeline_event_worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => timelineEvents.id, { onDelete: "cascade" }),
  worldId: uuid("world_id").notNull().references(() => worlds.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: Event <-> Comic Issue
// ============================================================================
export const timelineEventComics = pgTable("timeline_event_comics", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => timelineEvents.id, { onDelete: "cascade" }),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: Event <-> Encyclopedia Entry (Artifact involved in event, etc.)
// ============================================================================
export const timelineEventEncyclopedia = pgTable("timeline_event_encyclopedia", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => timelineEvents.id, { onDelete: "cascade" }),
  entryId: uuid("entry_id").notNull().references(() => encyclopediaEntries.id, { onDelete: "cascade" }),
});

// ============================================================================
// Relations
// ============================================================================
export const timelineErasRelations = relations(timelineEras, ({ many }) => ({
  events: many(timelineEvents),
}));

export const timelineEventsRelations = relations(timelineEvents, ({ one, many }) => ({
  era: one(timelineEras, { fields: [timelineEvents.eraId], references: [timelineEras.id] }),
  characters: many(timelineEventCharacters),
  worlds: many(timelineEventWorlds),
  comics: many(timelineEventComics),
  encyclopediaEntries: many(timelineEventEncyclopedia),
}));

export const timelineEventCharactersRelations = relations(timelineEventCharacters, ({ one }) => ({
  event: one(timelineEvents, { fields: [timelineEventCharacters.eventId], references: [timelineEvents.id] }),
  character: one(characters, { fields: [timelineEventCharacters.characterId], references: [characters.id] }),
}));

export const timelineEventWorldsRelations = relations(timelineEventWorlds, ({ one }) => ({
  event: one(timelineEvents, { fields: [timelineEventWorlds.eventId], references: [timelineEvents.id] }),
  world: one(worlds, { fields: [timelineEventWorlds.worldId], references: [worlds.id] }),
}));

export const timelineEventComicsRelations = relations(timelineEventComics, ({ one }) => ({
  event: one(timelineEvents, { fields: [timelineEventComics.eventId], references: [timelineEvents.id] }),
  issue: one(comicIssues, { fields: [timelineEventComics.issueId], references: [comicIssues.id] }),
}));

export const timelineEventEncyclopediaRelations = relations(timelineEventEncyclopedia, ({ one }) => ({
  event: one(timelineEvents, { fields: [timelineEventEncyclopedia.eventId], references: [timelineEvents.id] }),
  entry: one(encyclopediaEntries, { fields: [timelineEventEncyclopedia.entryId], references: [encyclopediaEntries.id] }),
}));

// ============================================================================
// Zod & Types
// ============================================================================
export const insertTimelineEraSchema = createInsertSchema(timelineEras).omit({ id: true });
export type InsertTimelineEra = z.infer<typeof insertTimelineEraSchema>;
export type TimelineEra = typeof timelineEras.$inferSelect;

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({ id: true });
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
