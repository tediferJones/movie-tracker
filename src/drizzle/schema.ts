import { text, sqliteTable, integer, primaryKey, foreignKey } from 'drizzle-orm/sqlite-core';

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
  seriesId: text('seriesId'),
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

export const watched = sqliteTable('watched', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdbId').notNull(),
  username: text('username').notNull(),
  date: integer('date').notNull(),
})

export const reviews = sqliteTable('reviews', {
  username: text('username'),
  imdbId: text('imdbId'),
  watchAgain: integer('watchAgain', { mode: 'boolean' }),
  rating: integer('rating'),
  review: text('review'),
}, table => ({
    pk: primaryKey({
      columns: [
        table.username,
        table.imdbId,
      ]
    })
  }))

export const lists = sqliteTable('lists', {
  username: text('username'),
  listname: text('listname'),
  imdbId: text('imdbId'),
  defaultList: integer('defaultList', { mode: 'boolean' }).notNull(),
}, table => ({
    pk: primaryKey({
      columns: [
        table.username,
        table.listname,
        table.imdbId,
      ]
    })
  }))

// export const listnames = sqliteTable('listnames', {
//   username: text('username').notNull(),
//   listname: text('listname').notNull(),
// }, table => ({
//     pk: primaryKey({ columns: [
//       table.username,
//       table.listname,
//     ]})
//   }))
// 
// export const lists = sqliteTable('lists', {
//   imdbId: text('imdbId').notNull(),
//   username: text('username'),
//   listname: text('listname'),
// }, table => ({
//     // Error says its deprecated, but drizzle docs still recommends this method
//     // If it works just let it be
//     userReference: foreignKey(() => ({
//       columns: [table.username, table.listname],
//       foreignColumns: [listnames.username, listnames.listname],
//       name: 'listId'
//     }))
//   }))
