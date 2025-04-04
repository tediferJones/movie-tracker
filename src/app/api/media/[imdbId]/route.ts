import { db } from '@/drizzle/db';
import { countries, genres, languages, media, people } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import easyFetch from '@/lib/easyFetch';
import { StrIdxRawMedia } from '@/types';
import formatMediaInfo from '@/lib/formatMediaInfo';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  if (!cache.get(imdbId)) {
    try {
      const dbResult = await db.select().from(media).where(eq(media.imdbId, imdbId)).get();
      if (!dbResult) {
        await POST(req, { params });
        return await GET(req, { params });
      }
      cache.set(imdbId, dbResult);
    } catch {
      return NextResponse.json('Failed to process request, database error', { status: 500 });
    }
  }
  return cache.get(imdbId);
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  cache.delete(imdbId);
  const omdbResult = await easyFetch<StrIdxRawMedia>('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbId,
  });
  if (omdbResult?.Response !== 'True') return NextResponse.json('Not found', { status: 404 });
  const formattedMedia = formatMediaInfo(omdbResult);
  try {
    await db.insert(media).values(formattedMedia.mediaInfo);
    await db.insert(genres).values(formattedMedia.genres!);
    await db.insert(countries).values(formattedMedia.countries!);
    await db.insert(languages).values(formattedMedia.languages!);
    await db.insert(people).values(formattedMedia.people!);
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  cache.delete(imdbId);
  try {
    await db.delete(media).where(eq(media.imdbId, imdbId));
    await db.delete(genres).where(eq(genres.imdbId, imdbId));
    await db.delete(countries).where(eq(countries.imdbId, imdbId));
    await db.delete(languages).where(eq(languages.imdbId, imdbId));
    await db.delete(people).where(eq(people.imdbId, imdbId));
    return await POST(req, { params });
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
