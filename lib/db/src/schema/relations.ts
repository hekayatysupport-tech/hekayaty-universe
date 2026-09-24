import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const entityRelationsTable = pgTable("entity_relations", {
  id: text("id").primaryKey(),
  sourceType: text("source_type").notNull(), // 'character', 'world', 'comic', 'story', 'event', 'card'
  sourceId: text("source_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  relationType: text("relation_type").notNull(), // 'origin_world', 'featured_character', 'debut_story', 'timeline_event', 'card_binding'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
