import { pgTable, uuid, text, integer, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { media } from "./media";
import { characters } from "./characters";
import { userProfiles } from "./users";
import { contentStatusEnum } from "./common";

// ============================================================================
// Enums
// ============================================================================
export const seriesStatusEnum = pgEnum("series_status", ["Ongoing", "Completed", "Hiatus", "Cancelled", "Upcoming"]);

// ============================================================================
// Comic Series
// ============================================================================
export const comicSeries = pgTable("comic_series", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  description: text("description"),
  status: seriesStatusEnum("status").notNull().default("Ongoing"),
  coverMediaId: uuid("cover_media_id").references(() => media.id),
  
  // Auth & Workflow
  publishingStatus: contentStatusEnum("publishing_status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => userProfiles.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Story Arcs
// ============================================================================
export const storyArcs = pgTable("story_arcs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

// ============================================================================
// Comic Issues
// ============================================================================
export const comicIssues = pgTable("comic_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  seriesId: uuid("series_id").notNull().references(() => comicSeries.id, { onDelete: "cascade" }),
  issueNumber: integer("issue_number").notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  description: text("description"),
  releaseDate: date("release_date"),
  coverMediaId: uuid("cover_media_id").references(() => media.id),
  readingOrderGlobal: integer("reading_order_global"), // Global reading order across ALL series
  isSpecialEdition: text("is_special_edition"), // null = normal, or "variant", "anniversary", etc.
  
  // Auth & Workflow
  status: contentStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdBy: uuid("created_by").references(() => userProfiles.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => userProfiles.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Comic Pages (for the reader)
// ============================================================================
export const comicPages = pgTable("comic_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number").notNull(),
  mediaId: uuid("media_id").notNull().references(() => media.id),
});

// ============================================================================
// Comic Creative Team
// ============================================================================
export const comicCreativeTeam = pgTable("comic_creative_team", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // Writer, Artist, Colorist, Letterer, Editor
  name: text("name").notNull(),
});

// ============================================================================
// Junction: Issue <-> Story Arc
// ============================================================================
export const issueArcs = pgTable("issue_arcs", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  arcId: uuid("arc_id").notNull().references(() => storyArcs.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: Issue <-> Character (appearances)
// ============================================================================
export const characterAppearances = pgTable("character_appearances", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  role: text("role"), // Main, Supporting, Cameo
});

// ============================================================================
// Junction: Issue <-> Related Issues
// ============================================================================
export const relatedComics = pgTable("related_comics", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueIdA: uuid("issue_id_a").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  issueIdB: uuid("issue_id_b").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  relationship: text("relationship"), // sequel, prequel, crossover, tie-in
});

// ============================================================================
// Comic Gallery (M:N with media, for extra art)
// ============================================================================
export const comicGallery = pgTable("comic_gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
});

// ============================================================================
// Relations
// ============================================================================
export const comicSeriesRelations = relations(comicSeries, ({ one, many }) => ({
  cover: one(media, { fields: [comicSeries.coverMediaId], references: [media.id] }),
  issues: many(comicIssues),
}));

export const comicIssuesRelations = relations(comicIssues, ({ one, many }) => ({
  series: one(comicSeries, { fields: [comicIssues.seriesId], references: [comicSeries.id] }),
  cover: one(media, { fields: [comicIssues.coverMediaId], references: [media.id] }),
  pages: many(comicPages),
  creativeTeam: many(comicCreativeTeam),
  arcs: many(issueArcs),
  characterAppearances: many(characterAppearances),
  gallery: many(comicGallery),
}));

export const comicPagesRelations = relations(comicPages, ({ one }) => ({
  issue: one(comicIssues, { fields: [comicPages.issueId], references: [comicIssues.id] }),
  media: one(media, { fields: [comicPages.mediaId], references: [media.id] }),
}));

export const comicCreativeTeamRelations = relations(comicCreativeTeam, ({ one }) => ({
  issue: one(comicIssues, { fields: [comicCreativeTeam.issueId], references: [comicIssues.id] }),
}));

export const issueArcsRelations = relations(issueArcs, ({ one }) => ({
  issue: one(comicIssues, { fields: [issueArcs.issueId], references: [comicIssues.id] }),
  arc: one(storyArcs, { fields: [issueArcs.arcId], references: [storyArcs.id] }),
}));

export const characterAppearancesRelations = relations(characterAppearances, ({ one }) => ({
  character: one(characters, { fields: [characterAppearances.characterId], references: [characters.id] }),
  issue: one(comicIssues, { fields: [characterAppearances.issueId], references: [comicIssues.id] }),
}));

export const comicGalleryRelations = relations(comicGallery, ({ one }) => ({
  issue: one(comicIssues, { fields: [comicGallery.issueId], references: [comicIssues.id] }),
  media: one(media, { fields: [comicGallery.mediaId], references: [media.id] }),
}));

// ============================================================================
// Zod & Types
// ============================================================================
export const insertComicSeriesSchema = createInsertSchema(comicSeries).omit({ id: true, createdAt: true });
export type InsertComicSeries = z.infer<typeof insertComicSeriesSchema>;
export type ComicSeries = typeof comicSeries.$inferSelect;

export const insertComicIssueSchema = createInsertSchema(comicIssues).omit({ id: true, createdAt: true });
export type InsertComicIssue = z.infer<typeof insertComicIssueSchema>;
export type ComicIssue = typeof comicIssues.$inferSelect;
