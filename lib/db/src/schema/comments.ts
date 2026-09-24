import { pgTable, uuid, text, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { userProfiles } from "./users";
import { originals, storyChapters } from "./originals";
import { novelChaptersTable } from "./novels";
import { comicIssues } from "./comics";

// ============================================================================
// CHAPTER COMMENTS & DISCUSSIONS
// ============================================================================
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  originalId: uuid("original_id").references(() => originals.id, { onDelete: "cascade" }),
  storyChapterId: uuid("story_chapter_id").references(() => storyChapters.id, { onDelete: "cascade" }),
  novelChapterId: text("novel_chapter_id").references(() => novelChaptersTable.id, { onDelete: "cascade" }),
  comicIssueId: uuid("comic_issue_id").references(() => comicIssues.id, { onDelete: "cascade" }),
  
  content: text("content").notNull(),
  isSpoiler: boolean("is_spoiler").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  repliesCount: integer("replies_count").default(0).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const commentReplies = pgTable("comment_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  parentReplyId: uuid("parent_reply_id"), // Null for top-level reply, set for nested reply
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  
  content: text("content").notNull(),
  isSpoiler: boolean("is_spoiler").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const commentLikes = pgTable("comment_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  replyId: uuid("reply_id").references(() => commentReplies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const commentReports = pgTable("comment_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id").references(() => userProfiles.id, { onDelete: "cascade" }).notNull(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  replyId: uuid("reply_id").references(() => commentReplies.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending' | 'reviewed' | 'dismissed' | 'actioned'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
