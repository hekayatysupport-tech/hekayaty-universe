import { pgTable, uuid, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { userProfiles } from "./users";

// ============================================================================
// USER NOTIFICATIONS SYSTEM
// ============================================================================
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title").notNull(),
  message: text("message").notNull(),
  arabicMessage: text("arabic_message").notNull(),
  type: varchar("type", { length: 50 }).default("chapter_release").notNull(), 
  // 'chapter_release' | 'subscription_update' | 'milestone' | 'announcement' | 'comment_reply'
  linkUrl: text("link_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
