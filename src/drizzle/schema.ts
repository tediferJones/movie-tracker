import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

// Use this command to push changes to external DB:
// npx drizzle-kit push:sqlite

export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull().unique(),
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
  seriesId: integer('seriesId'),
  production: text('production'),
  website: text('website'),
  imdbRating: integer('imdbRating'),
  tomatoRating: integer('tomatoRating'),
  metaRating: integer('metaRating'),
});

export const people = sqliteTable('people', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull(),
  name: text('name').notNull(),
  position: text('position').notNull(),
})

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull(),
  genre: text('genre').notNull(),
})

export const languages = sqliteTable('languages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull(),
  language: text('language').notNull(),
})

export const countries = sqliteTable('countries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull(),
  country: text('country').notNull(),
})
