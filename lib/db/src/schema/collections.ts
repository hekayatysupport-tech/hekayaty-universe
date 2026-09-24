import { pgTable, uuid, text, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { userProfiles } from "./users";
import { originals } from "./originals";
import { novelsTable } from "./novels";
import { comicSeries } from "./comics";

// ============================================================================
// CUSTOM READING LISTS & COLLECTIONS
// ============================================================================
export const readingLists = pgTable("reading_lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  
  visibility: varchar("visibility", { length: 50 }).default("public").notNull(), // 'public' | 'private' | 'shared'
  isFeatured: boolean("is_featured").default(false).notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  itemsCount: integer("items_count").default(0).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const readingListItems = pgTable("reading_list_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  listId: uuid("list_id").references(() => readingLists.id, { onDelete: "cascade" }).notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  novelId: text("novel_id").references(() => novelsTable.id, { onDelete: "cascade" }),
  comicId: uuid("comic_id").references(() => comicSeries.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(1).notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});
