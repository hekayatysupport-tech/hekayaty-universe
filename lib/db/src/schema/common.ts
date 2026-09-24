import { pgEnum } from "drizzle-orm/pg-core";

// ============================================================================
// Content Publishing Status Enum
// Reused across characters, comics, worlds, news, etc.
// ============================================================================
export const contentStatusEnum = pgEnum("content_status", [
  "draft",        // Initial creation
  "in_review",    // Editor submits to Publisher
  "approved",     // Publisher approves
  "scheduled",    // Scheduled for future release (requires publishedAt)
  "published",    // Live and visible to the public
  "archived",     // Hidden from public, retained in DB
]);
