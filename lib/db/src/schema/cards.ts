import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const cardsTable = pgTable("cards", {
  id: text("id").primaryKey(),
  cardCode: text("card_code").notNull().unique(), // e.g. 'HEK-001'
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  characterId: text("character_id"),
  worldId: text("world_id"),
  rarity: text("rarity").notNull(), // 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'
  element: text("element").notNull(), // 'Solar', 'Void', 'Mystic', 'Physical', 'Cosmic'
  attack: integer("attack").notNull(),
  defense: integer("defense").notNull(),
  magic: integer("magic").notNull(),
  imageUrl: text("image_url").notNull(),
  flavorText: text("flavor_text"),
  arabicFlavorText: text("arabic_flavor_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCardsTable = pgTable("user_cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  cardId: text("card_id").references(() => cardsTable.id, { onDelete: "cascade" }).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
});
