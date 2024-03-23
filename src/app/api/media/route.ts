import { db } from '@/drizzle/db';
import { countries, genres, languages, media, people } from '@/drizzle/schema';
import easyFetch from '@/lib/easyFetch';
import { NextResponse } from 'next/server';
import { strIdxRawMedia, /*strIdxMedia*/ } from '@/types';
import formatMediaInfo from '@/lib/formatMediaInfo';
import { eq } from 'drizzle-orm';
// import cleanUpMediaInfo from '@/modules/cleanUpMediaInfo';
// import easyFetch from '@/modules/easyFetch';
// import prisma from '@/client';

async function getExistingMedia(imdbId: string, mediaInfo?: typeof media.$inferSelect) {
  return {
    ...(mediaInfo ? mediaInfo : await db.select().from(media).where(eq(media.imdbId, imdbId)).get()),
    genres: (await db.select({ genre: genres.genre }).from(genres).where(eq(genres.imdbId, imdbId)))
    .map(rec => rec.genre)
    ,
    countries: (await db.select({ country: countries.country }).from(countries).where(eq(countries.imdbId, imdbId)))
    .map(rec => rec.country)
    ,
    languages: (await db.select({ language: languages.language }).from(languages).where(eq(languages.imdbId, imdbId)))
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

export async function GET(req: Request) {
  const imdbId = new URL(req.url).searchParams.get('imdbId')

  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  // await db.delete(media)
  // await db.delete(genres)
  // await db.delete(countries)
  // await db.delete(languages)
  // await db.delete(people)

  // If result already exists in db, return related records
  const dbResult = await db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (dbResult) {
    return NextResponse.json(await getExistingMedia(imdbId, dbResult))
  }

  // if imdbId does not exist, fetch info and add to db
  const omdbResult = await easyFetch<strIdxRawMedia>('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbId,
  })
  if (omdbResult.Response !== 'True') return NextResponse.json('Not found', { status: 404 })
  const formattedMedia = formatMediaInfo(omdbResult);
  console.log('orignal', omdbResult)
  console.log('formatted', formattedMedia)

  try {
    await db.insert(media).values(formattedMedia.mediaInfo)
    await db.insert(genres).values(formattedMedia.genres)
    await db.insert(countries).values(formattedMedia.countries)
    await db.insert(languages).values(formattedMedia.languages)
    await db.insert(people).values(formattedMedia.people)
  } catch (err) {
    console.log('THIS IS THE ERROR', err)
  }

  return NextResponse.json(await getExistingMedia(imdbId))
}

// export async function GET(req: Request) {
//   console.log('\n FETCH SINGLE MOVIE RECORD FROM DB \n')
//   const imdbID = new URL(req.url).searchParams.get('imdbID')
//   let result = null;
// 
//   if (imdbID) {
//     result = await prisma.media.findFirst({ where: { imdbID } })
//   }
// 
//   return NextResponse.json(result, { status: result ? 200 : 404 })
// }
// 
// export async function POST(req: Request) {
//   const { imdbID } = await req.json();
//   const rawData: strIdxRawMedia = await easyFetch('https://www.omdbapi.com/', 'GET', {
//     apikey: process.env.OMDBAPI_KEY,
//     i: imdbID,
//   })
// 
//   if (rawData.Response === 'True') {
//     const data: strIdxMedia = cleanUpMediaInfo(rawData);
//     await prisma.media.create({ data });
//     return NextResponse.json('\n Added movie to DB from /api/media \n')
//   }
// 
//   return NextResponse.json('\n Failed to add movie to DB from /api/media \n')
// }
// 
// export async function PUT(req: Request) {
//   const { imdbID } = await req.json();
//   const result = await easyFetch('https://www.omdbapi.com/', 'GET', {
//     apikey: process.env.OMDBAPI_KEY,
//     i: imdbID,
//   })
// 
//   if (result.Response === 'True') {
//     let data = cleanUpMediaInfo(result);
//     await prisma.media.update({
//       where: {
//         imdbID: data.imdbID,
//       },
//       data,
//     })
//     console.log(`\n SUCCESSFUL UPDATE OF MOVIE: ${data.Title} \n`)
//     return NextResponse.json({ movieHasBeenUpdated: true })
//   }
// 
//   return NextResponse.json({ movieHasBeenUpdated: false })
// }
