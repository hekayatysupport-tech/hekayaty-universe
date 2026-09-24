import { pgTable, text, timestamp, uuid, jsonb, varchar } from "drizzle-orm/pg-core";
import { userProfiles } from "./users";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Who performed the action
  userId: uuid("user_id").references(() => userProfiles.id, { onDelete: "set null" }),
  
  // Action taken (e.g., 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH')
  action: varchar("action", { length: 50 }).notNull(),
  
  // What was affected (e.g., 'character', 'comic_issue')
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  
  // The ID of the affected resource (stored as string to support UUID or standard IDs if any exist)
  resourceId: varchar("resource_id", { length: 255 }),
  
  // Changes made or additional context (e.g., previous state vs new state)
  details: jsonb("details"),

  // When it happened
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // IP or user agent if tracking strict security (optional)
  ipAddress: varchar("ip_address", { length: 45 }),
});
