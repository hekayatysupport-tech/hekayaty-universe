import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { contentStatusEnum } from "./common";

export const novelsTable = pgTable("novels", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  tagline: text("tagline"),
  arabicTagline: text("arabic_tagline"),
  summary: text("summary").notNull(),
  arabicSummary: text("arabic_summary").notNull(),
  coverUrl: text("cover_url"),
  bannerUrl: text("banner_url"),
  authorId: text("author_id"),
  status: contentStatusEnum("status").default("draft").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  totalChapters: integer("total_chapters").default(0).notNull(),
  rating: text("rating").default("4.9"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const novelChaptersTable = pgTable("novel_chapters", {
  id: text("id").primaryKey(),
  novelId: text("novel_id").references(() => novelsTable.id, { onDelete: "cascade" }).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  content: text("content").notNull(),
  arabicContent: text("arabic_content").notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  readTimeMinutes: integer("read_time_minutes").default(5),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
