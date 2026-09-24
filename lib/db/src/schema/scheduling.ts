import { pgTable, uuid, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { originals, storyChapters } from "./originals";
import { novelsTable, novelChaptersTable } from "./novels";
import { comicIssues } from "./comics";

// ============================================================================
// CONTENT RELEASE SCHEDULING & PUBLISHING CALENDAR
// ============================================================================
export const contentSchedules = pgTable("content_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  storyChapterId: uuid("story_chapter_id").references(() => storyChapters.id, { onDelete: "cascade" }),
  novelId: text("novel_id").references(() => novelsTable.id, { onDelete: "cascade" }),
  novelChapterId: text("novel_chapter_id").references(() => novelChaptersTable.id, { onDelete: "cascade" }),
  comicIssueId: uuid("comic_issue_id").references(() => comicIssues.id, { onDelete: "cascade" }),
  
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // 'scheduled' | 'published' | 'cancelled' | 'failed'
  releaseNotes: text("release_notes"),
  notifySubscribers: boolean("notify_subscribers").default(true).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
