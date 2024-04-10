import { text, sqliteTable, integer, primaryKey, foreignKey } from 'drizzle-orm/sqlite-core';

// Use this command to push changes to external DB:
// npx drizzle-kit push:sqlite

export const media = sqliteTable('media', {
  imdbId: text('imdbId').primaryKey(),
  title: text('title').notNull(),
  startYear: integer('startYear').notNull(),
  endYear: integer('endYear'),
  rated: text('rated'),
  released: integer('released'),
  runtime: integer('runtime'),
  plot: text('plot'),
  awards: text('awards'),
  poster: text('poster'),
  imdbVotes: integer('imdbVotes'),
  type: text('text'),
  dvd: integer('dvd'),
  boxOffice: integer('boxOffice'),
  totalSeasons: integer('totalSeasons'),
  season: integer('season'),
  episode: integer('episode'),
  seriesId: text('seriesId'),
  production: text('production'),
  website: text('website'),
  imdbRating: integer('imdbRating'),
  tomatoRating: integer('tomatoRating'),
  metaRating: integer('metaRating'),
  updatedAt: integer('updatedAt').notNull(),
});

export const people = sqliteTable('people', {
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  position: text('position').notNull(),
}, table => ({
    pk: primaryKey({ columns: [ table.imdbId, table.name, table.position ] })
  }));

export const genres = sqliteTable('genres', {
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  genre: text('genre').notNull(),
}, table => ({
    pk: primaryKey({ columns: [ table.imdbId, table.genre ] })
  }));

export const languages = sqliteTable('languages', {
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  language: text('language').notNull(),
}, table => ({
    pk: primaryKey({ columns: [ table.imdbId, table.language ] })
  }));

export const countries = sqliteTable('countries', {
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  country: text('country').notNull(),
}, table => ({
    pk: primaryKey({ columns: [ table.imdbId, table.country ] })
  }));

export const watched = sqliteTable('watched', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  username: text('username').notNull(),
  date: integer('date').notNull(),
});

export const reviews = sqliteTable('reviews', {
  username: text('username').notNull(),
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  watchAgain: integer('watchAgain', { mode: 'boolean' }),
  rating: integer('rating'),
  review: text('review'),
}, table => ({
    pk: primaryKey({ columns: [ table.username, table.imdbId ] })
  }));

export const listnames = sqliteTable('listnames', {
  username: text('username').notNull(),
  listname: text('listname').notNull(),
  defaultList: integer('defaultList', { mode: 'boolean' }).notNull(),
}, table => ({
    pk: primaryKey({ columns: [ table.username, table.listname ] })
  }));

export const lists = sqliteTable('lists', {
  imdbId: text('imdbId').notNull().references(() => media.imdbId, { onDelete: 'cascade' }),
  username: text('username'),
  listname: text('listname'),
}, table => ({
    pk: primaryKey({ columns: [ table.imdbId, table.username, table.listname ] }),
    fk: foreignKey({
      columns: [table.username, table.listname],
      foreignColumns: [listnames.username, listnames.listname],
      name: 'listId',
    }).onDelete('cascade')
  }));
