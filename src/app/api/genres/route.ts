import { db } from '@/drizzle/db';
import { genres } from '@/drizzle/schema';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';

// FIX ME
// All these api routes need re-worked
// /api/genres
// /api/languages
// /api/countries
// /api/people
//
// each should have a nested route like /api/resource/[resourceName]

export async function GET(req: Request) {
  const genre = new URL(req.url).searchParams.get('genre');

  if (genre) {
    const genreRecs = (
      await db.select({ imdbId: genres.imdbId }).from(genres).where(
        eq(genres.genre, genre)
      )
    );
    return NextResponse.json(
      await getManyExistingMedia(genreRecs.map(rec => rec.imdbId))
    );
  }

  return NextResponse.json(
    (await db.selectDistinct({ genre: genres.genre, count: count(genres.genre) }).from(genres).groupBy(genres.genre))
      .sort((a, b) => a.genre.localeCompare(b.genre))
  )
}
