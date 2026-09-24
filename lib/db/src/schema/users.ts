import { pgTable, uuid, text, integer, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { media } from "./media";
import { characters } from "./characters";
import { comicIssues } from "./comics";

// ============================================================================
// Roles Enum
// ============================================================================
export const userRoleEnum = pgEnum("user_role", [
  "visitor",        // Unauthenticated / default read-only
  "explorer",       // Registered user, can save favorites
  "moderator",      // Can moderate comments
  "editor",         // Can edit content, create drafts
  "publisher",      // Can publish content
  "administrator",  // Can manage most settings/users
  "super_admin",    // Unrestricted
]);

// ============================================================================
// User Profiles (designed for Supabase Auth integration)
// The `id` here will match the Supabase Auth user UID.
// ============================================================================
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey(), // Supabase Auth UID — NOT auto-generated
  username: text("username").unique(),
  displayName: text("display_name"),
  role: text("role").default("reader").notNull(),
  avatarMediaId: uuid("avatar_media_id").references(() => media.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// User Roles (Many-to-Many just in case a user has multiple roles)
// ============================================================================
export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  grantedBy: uuid("granted_by").references(() => userProfiles.id), // Which admin granted this
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.role] }),
  };
});

// ============================================================================
// Favorite Characters
// ============================================================================
export const userFavoriteCharacters = pgTable("user_favorite_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// Saved Comics (reading progress)
// ============================================================================
export const userSavedComics = pgTable("user_saved_comics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  issueId: uuid("issue_id").notNull().references(() => comicIssues.id, { onDelete: "cascade" }),
  readStatus: text("read_status").notNull().default("unread"), // unread, reading, completed
  lastPageRead: integer("last_page_read").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Achievements / Badges
// ============================================================================
export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  iconMediaId: uuid("icon_media_id").references(() => media.id),
  category: text("category"), // reading, exploration, collection, lore
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// ============================================================================
// Relations
// ============================================================================
export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  avatar: one(media, { fields: [userProfiles.avatarMediaId], references: [media.id] }),
  favoriteCharacters: many(userFavoriteCharacters),
  savedComics: many(userSavedComics),
  achievements: many(userAchievements),
}));

export const userFavoriteCharactersRelations = relations(userFavoriteCharacters, ({ one }) => ({
  user: one(userProfiles, { fields: [userFavoriteCharacters.userId], references: [userProfiles.id] }),
  character: one(characters, { fields: [userFavoriteCharacters.characterId], references: [characters.id] }),
}));

export const userSavedComicsRelations = relations(userSavedComics, ({ one }) => ({
  user: one(userProfiles, { fields: [userSavedComics.userId], references: [userProfiles.id] }),
  issue: one(comicIssues, { fields: [userSavedComics.issueId], references: [comicIssues.id] }),
}));

export const achievementsRelations = relations(achievements, ({ one, many }) => ({
  icon: one(media, { fields: [achievements.iconMediaId], references: [media.id] }),
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(userProfiles, { fields: [userAchievements.userId], references: [userProfiles.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

// ============================================================================
// Zod & Types
// ============================================================================
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ createdAt: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
