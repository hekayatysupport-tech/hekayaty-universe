import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { media } from "./media";
import { characters } from "./characters";
import { comicIssues } from "./comics";
import { userProfiles } from "./users";
import { contentStatusEnum } from "./common";

// ============================================================================
// News Articles
// ============================================================================
export const news = pgTable("news", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(), // Announcement, Release, Trailer, Event, Update
  content: text("content"),
  excerpt: text("excerpt"),
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
// News Tags
// ============================================================================
export const newsTags = pgTable("news_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  newsId: uuid("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

// ============================================================================
// Junction: News <-> Character
// ============================================================================
export const newsRelatedCharacters = pgTable("news_related_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  newsId: uuid("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
});

// ============================================================================
// Junction: News <-> Comic Issue
// ============================================================================
export const newsRelatedComics = pgTable("news_related_comics", {
  id: uuid("id").defaultRandom().primaryKey(),
  newsId: uuid("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
});

// ============================================================================
// Relations
// ============================================================================
export const newsRelations = relations(news, ({ one, many }) => ({
  cover: one(media, { fields: [news.coverMediaId], references: [media.id] }),
  tags: many(newsTags),
  relatedCharacters: many(newsRelatedCharacters),
  relatedComics: many(newsRelatedComics),
}));

export const newsTagsRelations = relations(newsTags, ({ one }) => ({
  news: one(news, { fields: [newsTags.newsId], references: [news.id] }),
}));

export const newsRelatedCharactersRelations = relations(newsRelatedCharacters, ({ one }) => ({
  news: one(news, { fields: [newsRelatedCharacters.newsId], references: [news.id] }),
  character: one(characters, { fields: [newsRelatedCharacters.characterId], references: [characters.id] }),
}));

export const newsRelatedComicsRelations = relations(newsRelatedComics, ({ one }) => ({
  news: one(news, { fields: [newsRelatedComics.newsId], references: [news.id] }),
  issue: one(comicIssues, { fields: [newsRelatedComics.issueId], references: [comicIssues.id] }),
}));

// ============================================================================
// Zod & Types
// ============================================================================
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;
