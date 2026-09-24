import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { media } from "./media";
import { characters } from "./characters";
import { worlds } from "./worlds";
import { timelineEvents } from "./timeline";
import { encyclopediaEntries } from "./encyclopedia";
import { comicIssues } from "./comics";

// ============================================================================
// HEKAYATY ORIGINALS
// ============================================================================
export const originals = pgTable("originals", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  arabicDescription: text("arabic_description"),
  contentType: varchar("content_type", { length: 50 }).notNull().default("story"), 
  // 'story' | 'comic' | 'episode' | 'lore' | 'character_file' | 'art_book' | 'behind_the_scenes' | 'special_release'
  accessLevel: varchar("access_level", { length: 50 }).notNull().default("public"), 
  // 'public' | 'free_preview' | 'subscriber' | 'early_access' | 'scheduled'
  status: varchar("status", { length: 50 }).notNull().default("draft"), 
  // 'draft' | 'review' | 'published' | 'archived'
  isFeatured: boolean("is_featured").default(false).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  isNew: boolean("is_new").default(true).notNull(),
  isComingSoon: boolean("is_coming_soon").default(false).notNull(),
  creatorName: text("creator_name").default("Hekayaty Studios"),
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  bannerMediaId: uuid("banner_media_id").references(() => media.id, { onDelete: "set null" }),
  releaseDate: timestamp("release_date", { withTimezone: true }),
  earlyAccessDate: timestamp("early_access_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// STORIES & CHAPTERS
// ============================================================================
export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  synopsis: text("synopsis"),
  authorName: text("author_name").default("Hekayaty Team"),
  coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const storyChapters = pgTable("story_chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  content: text("content").notNull(),
  arabicContent: text("arabic_content"),
  readTimeMinutes: integer("read_time_minutes").default(5),
  accessLevel: varchar("access_level", { length: 50 }).notNull().default("subscriber"),
  status: varchar("status", { length: 50 }).notNull().default("published"),
  sortOrder: integer("sort_order").default(1).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// EPISODES
// ============================================================================
export const episodes = pgTable("episodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  seasonNumber: integer("season_number").default(1).notNull(),
  episodeNumber: integer("episode_number").notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  description: text("description"),
  mediaUrl: text("media_url"),
  durationMinutes: integer("duration_minutes"),
  accessLevel: varchar("access_level", { length: 50 }).notNull().default("subscriber"),
  status: varchar("status", { length: 50 }).notNull().default("published"),
  thumbnailMediaId: uuid("thumbnail_media_id").references(() => media.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// GENRES & TAGS
// ============================================================================
export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  arabicName: text("arabic_name").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const contentGenres = pgTable("content_genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  genreId: uuid("genre_id").references(() => genres.id, { onDelete: "cascade" }).notNull(),
});

// ============================================================================
// SUBSCRIPTIONS & MANUAL INSTAPAY PAYMENTS
// ============================================================================
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  planType: varchar("plan_type", { length: 50 }).notNull(), // 'monthly' | 'quarterly' | 'yearly'
  amountEgp: integer("amount_egp").notNull(), // 59 | 139 | 499
  status: varchar("status", { length: 50 }).notNull().default("pending"), 
  // 'pending' | 'active' | 'expired' | 'cancelled' | 'rejected'
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  paymentReference: varchar("payment_reference", { length: 255 }),
  paymentProvider: varchar("payment_provider", { length: 50 }).default("instapay"),
  autoRenew: boolean("auto_renew").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),
  userId: uuid("user_id").notNull(),
  amountEgp: integer("amount_egp").notNull(),
  currency: varchar("currency", { length: 10 }).default("EGP").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending_verification"), 
  // 'pending_verification' | 'verified' | 'rejected' | 'cancelled'
  paymentMethod: varchar("payment_method", { length: 50 }).default("instapay"),
  transactionRef: varchar("transaction_ref", { length: 255 }).notNull(), // InstaPay Reference / Transaction ID
  senderAccount: varchar("sender_account", { length: 255 }), // User's InstaPay phone / handle
  rejectionReason: text("rejection_reason"),
  verifiedBy: uuid("verified_by"), // Admin user ID who reviewed the payment
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// MY LIBRARY & READING PROGRESS
// ============================================================================
export const userLibrary = pgTable("user_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userReadingProgress = pgTable("user_reading_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  storyChapterId: uuid("story_chapter_id").references(() => storyChapters.id, { onDelete: "set null" }),
  comicIssueId: uuid("comic_issue_id").references(() => comicIssues.id, { onDelete: "set null" }),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  lastPageNumber: integer("last_page_number").default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// ORIGINALS JUNCTION TABLES
// ============================================================================
export const originalCharacters = pgTable("original_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  characterId: uuid("character_id").references(() => characters.id, { onDelete: "cascade" }).notNull(),
});

export const originalWorlds = pgTable("original_worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  worldId: uuid("world_id").references(() => worlds.id, { onDelete: "cascade" }).notNull(),
});

export const originalTimelineEvents = pgTable("original_timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  eventId: uuid("event_id").references(() => timelineEvents.id, { onDelete: "cascade" }).notNull(),
});

export const originalEncyclopediaEntries = pgTable("original_encyclopedia_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }).notNull(),
  entryId: uuid("entry_id").references(() => encyclopediaEntries.id, { onDelete: "cascade" }).notNull(),
});
