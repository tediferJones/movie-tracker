import { 
  media,
  people,
  genres,
  countries,
  languages,
} from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { eq } from 'drizzle-orm';
import easyFetch from '@/lib/easyFetch';
import { NextResponse } from 'next/server';
import { StrIdxRawMedia } from '@/types';
import formatMediaInfo from '@/lib/formatMediaInfo';
import getExistingMedia from '@/lib/getExistingMedia';

const tableLinker: { [key: string]: any } = {
  genres: genres,
  countries: countries,
  languages: languages,
  people: people,
}

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

  // If result already exists in db, return related records
  const dbResult = await db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (dbResult) return NextResponse.json(await getExistingMedia(imdbId, dbResult));

  // if imdbId does not exist, fetch info and add to db
  const omdbResult = await easyFetch<StrIdxRawMedia>('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbId,
  });
  if (omdbResult?.Response !== 'True') return NextResponse.json('Not found', { status: 404 });
  const formattedMedia = formatMediaInfo(omdbResult);

  try {
    await db.insert(media).values(formattedMedia.mediaInfo);
    await Promise.all(
      Object.keys(tableLinker).map(async tableName => {
        if (formattedMedia[tableName]) {
          await db.insert(tableLinker[tableName]).values(formattedMedia[tableName])
        }
      })
    );
  } finally {
    return NextResponse.json(await getExistingMedia(imdbId));
  }
}

export async function PUT(req: Request) {
  const { imdbId } = await req.json();
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 });

  const mediaExists = db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (!mediaExists) return NextResponse.json('Media does not exist', { status: 404 });
  
  const omdbResult = await easyFetch<StrIdxRawMedia>('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbId,
  });
  if (omdbResult?.Response !== 'True') return NextResponse.json('Not found', { status: 404 });
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

  return new NextResponse;
}
