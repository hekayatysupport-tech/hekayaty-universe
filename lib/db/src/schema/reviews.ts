import { pgTable, uuid, text, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { userProfiles } from "./users";
import { originals } from "./originals";
import { novelsTable } from "./novels";

// ============================================================================
// RATINGS & REVIEWS SYSTEM
// ============================================================================
export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  novelId: text("novel_id").references(() => novelsTable.id, { onDelete: "cascade" }),
  
  ratingStars: integer("rating_stars").notNull(), // 1 to 5
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  novelId: text("novel_id").references(() => novelsTable.id, { onDelete: "cascade" }),
  
  ratingStars: integer("rating_stars").notNull(), // 1 to 5
  title: text("title").notNull(),
  body: text("body").notNull(),
  isSpoiler: boolean("is_spoiler").default(false).notNull(),
  isVerifiedSubscriber: boolean("is_verified_subscriber").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  helpfulVotes: integer("helpful_votes").default(0).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviewVotes = pgTable("review_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }).notNull(),
  isHelpful: boolean("is_helpful").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
