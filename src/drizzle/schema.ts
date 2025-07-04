import { sqliteTable, AnySQLiteColumn, text, integer, foreignKey, primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const media = sqliteTable("media", {
	imdbId: text("imdbId").primaryKey().notNull(),
	title: text("title").notNull(),
	startYear: integer("startYear").notNull(),
	endYear: integer("endYear"),
	rated: text("rated"),
	released: integer("released"),
	runtime: integer("runtime"),
	plot: text("plot"),
	awards: text("awards"),
	poster: text("poster"),
	imdbVotes: integer("imdbVotes"),
	type: text("type"),
	dvd: integer("dvd"),
	boxOffice: integer("boxOffice"),
	totalSeasons: integer("totalSeasons"),
	season: integer("season"),
	episode: integer("episode"),
	seriesId: text("seriesId"),
	production: text("production"),
	website: text("website"),
	imdbRating: integer("imdbRating"),
	tomatoRating: integer("tomatoRating"),
	metaRating: integer("metaRating"),
	updatedAt: integer("updatedAt").notNull(),
});

export const watched = sqliteTable("watched", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	username: text("username").notNull(),
	date: integer("date").notNull(),
});

export const people = sqliteTable("people", {
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	name: text("name").notNull(),
	position: text("position").notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.imdbId, table.name, table.position], name: "people_imdbId_name_position_pk"})
	}
});

export const genres = sqliteTable("genres", {
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	genre: text("genre").notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.genre, table.imdbId], name: "genres_genre_imdbId_pk"})
	}
});

export const countries = sqliteTable("countries", {
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	country: text("country").notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.country, table.imdbId], name: "countries_country_imdbId_pk"})
	}
});

export const languages = sqliteTable("languages", {
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	language: text("language").notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.imdbId, table.language], name: "languages_imdbId_language_pk"})
	}
});

export const reviews = sqliteTable("reviews", {
	username: text("username").notNull(),
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	watchAgain: integer("watchAgain", { mode: 'boolean' }),
	rating: integer("rating"),
	review: text("review"),
	date: integer("date").notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.imdbId, table.username], name: "reviews_imdbId_username_pk"})
	}
});

export const listnames = sqliteTable("listnames", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	username: text("username").notNull(),
	listname: text("listname").notNull(),
	defaultList: integer("defaultList", { mode: 'boolean' }).notNull(),
	date: integer("date").notNull(),
},
(table) => {
	return {
		usernameListnameUnique: uniqueIndex("listnames_username_listname_unique").on(table.username, table.listname),
	}
});

export const lists = sqliteTable("lists", {
	imdbId: text("imdbId").notNull().references(() => media.imdbId, { onDelete: "cascade" } ),
	listnameId: integer("listnameId").notNull().references(() => listnames.id, { onDelete: "cascade" } ),
	username: text("username").notNull(),
	listname: text("listname").notNull(),
	date: integer("date").notNull(),
},
(table) => {
	return {
		pk0: primaryKey({ columns: [table.imdbId, table.listnameId], name: "lists_imdbId_listnameId_pk"})
	}
});
