import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { userProfiles } from "./users";

export const writersTable = pgTable("writers", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").references(() => userProfiles.id),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  role: text("role").notNull(), // 'Lead Lore Architect', 'Senior Comic Writer', 'Master Illustrator'
  arabicRole: text("arabic_role").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  bannerUrl: text("banner_url"),
  bio: text("bio").notNull(),
  arabicBio: text("arabic_bio").notNull(),
  worksCount: integer("works_count").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const writerPostsTable = pgTable("writer_posts", {
  id: text("id").primaryKey(),
  writerId: text("writer_id").notNull().references(() => writersTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  arabicTitle: text("arabic_title"),
  content: text("content").notNull(),
  arabicContent: text("arabic_content"),
  imageUrl: text("image_url"),
  likesCount: integer("likes_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const writerPostCommentsTable = pgTable("writer_post_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => writerPostsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  displayName: text("display_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
