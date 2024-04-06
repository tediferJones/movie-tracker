import { db } from '@/drizzle/db';
import { countries, genres, languages, media, people } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export default async function getExistingMedia(imdbId: string, mediaInfo?: typeof media.$inferSelect) {
  return {
    ...(mediaInfo ? mediaInfo : await db.select().from(media).where(eq(media.imdbId, imdbId)).get()),
    genre: (await db.select({ genre: genres.genre }).from(genres).where(eq(genres.imdbId, imdbId)))
    .map(rec => rec.genre)
    ,
    country: (await db.select({ country: countries.country }).from(countries).where(eq(countries.imdbId, imdbId)))
    .map(rec => rec.country)
    ,
    language: (await db.select({ language: languages.language }).from(languages).where(eq(languages.imdbId, imdbId)))
    .map(rec => rec.language)
    ,
    ...(await db.select({ name: people.name, position: people.position }).from(people).where(eq(people.imdbId, imdbId)))
    .reduce((newObj, rec) => {
      if (!newObj[rec.position]) newObj[rec.position] = [];
      newObj[rec.position].push(rec.name)
      return newObj
    }, {} as { [key: string]: string[] })
    ,
  }
}

