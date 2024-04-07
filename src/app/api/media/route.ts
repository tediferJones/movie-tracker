import { 
  countries,
  genres,
  languages,
  listnames,
  lists,
  media,
  people,
  reviews,
  watched
} from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import easyFetch from '@/lib/easyFetch';
import { NextResponse } from 'next/server';
import { strIdxRawMedia } from '@/types';
import formatMediaInfo from '@/lib/formatMediaInfo';
import getExistingMedia from '@/lib/getExistingMedia';

const tableLinker: { [key: string]: any } = {
  genres: genres,
  countries: countries,
  languages: languages,
  people: people,
}

// async function getExistingMedia(imdbId: string, mediaInfo?: typeof media.$inferSelect) {
//   return {
//     ...(mediaInfo ? mediaInfo : await db.select().from(media).where(eq(media.imdbId, imdbId)).get()),
//     genre: (await db.select({ genre: genres.genre }).from(genres).where(eq(genres.imdbId, imdbId)))
//     .map(rec => rec.genre)
//     ,
//     country: (await db.select({ country: countries.country }).from(countries).where(eq(countries.imdbId, imdbId)))
//     .map(rec => rec.country)
//     ,
//     language: (await db.select({ language: languages.language }).from(languages).where(eq(languages.imdbId, imdbId)))
//     .map(rec => rec.language)
//     ,
//     ...(await db.select({ name: people.name, position: people.position }).from(people).where(eq(people.imdbId, imdbId)))
//     .reduce((newObj, rec) => {
//       if (!newObj[rec.position]) newObj[rec.position] = [];
//       newObj[rec.position].push(rec.name)
//       return newObj
//     }, {} as { [key: string]: string[] })
//     ,
//   }
// }

export async function GET(req: Request) {
  const imdbId = new URL(req.url).searchParams.get('imdbId');

  // If no imdbId is specified, return all media
  if (!imdbId) {
    return NextResponse.json(
      await Promise.all(
        (await db.select().from(media).all())
          .map(async media => await getExistingMedia(media.imdbId, media))
      )
    )
  }

  // await db.delete(media)
  // await db.delete(listnames)

  // await db.delete(genres)
  // await db.delete(countries)
  // await db.delete(languages)
  // await db.delete(people)
  // await db.delete(watched)
  // await db.delete(lists)
  // await db.delete(listnames)
  // await db.delete(reviews)
  // await db.delete(media)

  // If result already exists in db, return related records
  const dbResult = await db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (dbResult) return NextResponse.json(await getExistingMedia(imdbId, dbResult));

  // if imdbId does not exist, fetch info and add to db
  const omdbResult = await easyFetch<strIdxRawMedia>('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbId,
  });
  if (omdbResult.Response !== 'True') return NextResponse.json('Not found', { status: 404 });
  console.log('orignal', omdbResult)
  const formattedMedia = formatMediaInfo(omdbResult);
  console.log('formatted', formattedMedia)

  try {
    await db.insert(media).values(formattedMedia.mediaInfo);
    // await db.insert(genres).values(formattedMedia.genres);
    // await db.insert(countries).values(formattedMedia.countries);
    // await db.insert(languages).values(formattedMedia.languages);
    // await db.insert(people).values(formattedMedia.people);
    await Promise.all(
      Object.keys(tableLinker).map(async tableName => {
        if (formattedMedia[tableName]) {
          await db.insert(tableLinker[tableName]).values(formattedMedia[tableName])
        }
      })
    );
  } catch (err) {
    console.log('THIS IS THE ERROR', err);
  }

  return NextResponse.json(await getExistingMedia(imdbId));
}

export async function PUT(req: Request) {
  const { imdbId } = await req.json();
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 });

  const mediaExists = db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (!mediaExists) return NextResponse.json('Media does not exist', { status: 404 });
  
  const omdbResult = await easyFetch<strIdxRawMedia>('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbId,
  });
  if (omdbResult.Response !== 'True') return NextResponse.json('Not found', { status: 404 });
  const formattedMedia = formatMediaInfo(omdbResult);

  await db.update(media).set(formattedMedia.mediaInfo).where(eq(media.imdbId, imdbId));

  await Promise.all(
    Object.keys(tableLinker).map(async tableName => {
      const table = tableLinker[tableName]
      await db.delete(table).where(eq(table.imdbId, imdbId));
      if (formattedMedia[tableName]) {
        await db.insert(table).values(formattedMedia[tableName]);
      }
    })
  );
  // await db.delete(genres).where(eq(genres.imdbId, imdbId));
  // await db.insert(genres).values(formattedMedia.genres);

  // await db.delete(countries).where(eq(countries.imdbId, imdbId));
  // await db.insert(countries).values(formattedMedia.countries);

  // await db.delete(languages).where(eq(languages.imdbId, imdbId));
  // await db.insert(languages).values(formattedMedia.languages);

  // await db.delete(people).where(eq(people.imdbId, imdbId));
  // await db.insert(people).values(formattedMedia.people);

  return new NextResponse;
}
