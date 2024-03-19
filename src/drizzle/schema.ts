import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

// Use this command to push changes to external DB:
// npx drizzle-kit push:sqlite

export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  imdbId: text('imdbId').notNull().unique(),
  // username: text('username').notNull().unique(),
  // iv: text('iv').notNull(),
  // vault: text('vault').notNull(),
});
