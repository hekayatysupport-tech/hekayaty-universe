import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { writersTable } from "./writers";
import { originals, storyChapters } from "./originals";

// ============================================================================
// WRITER STUDIO & CREATOR ANALYTICS
// ============================================================================
export const writerAnalytics = pgTable("writer_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  writerId: text("writer_id").references(() => writersTable.id, { onDelete: "cascade" }).notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  storyChapterId: uuid("story_chapter_id").references(() => storyChapters.id, { onDelete: "cascade" }),
  
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  dailyReads: integer("daily_reads").default(0).notNull(),
  dailyReadingMinutes: integer("daily_reading_minutes").default(0).notNull(),
  completionCount: integer("completion_count").default(0).notNull(),
  retentionRatePercent: integer("retention_rate_percent").default(100).notNull(),
  newFollowersCount: integer("new_followers_count").default(0).notNull(),
  estimatedRevenueEgp: integer("estimated_revenue_egp").default(0).notNull(),
});

export const writerFollowers = pgTable("writer_followers", {
  id: uuid("id").defaultRandom().primaryKey(),
  writerId: text("writer_id").references(() => writersTable.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").notNull(),
  followedAt: timestamp("followed_at", { withTimezone: true }).defaultNow().notNull(),
});
