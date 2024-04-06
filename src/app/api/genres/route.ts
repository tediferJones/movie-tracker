import { db } from '@/drizzle/db';
import { genres } from '@/drizzle/schema';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import getExistingMedia from '@/lib/getExistingMedia';

export async function GET(req: Request) {
  const genre = new URL(req.url).searchParams.get('genre');

  if (genre) {
    return NextResponse.json(
      await Promise.all(
        (await db.select({ imdbId: genres.imdbId }).from(genres).where(eq(genres.genre, genre)))
          .map(async rec => await getExistingMedia(rec.imdbId))
      )
    )
  }

  return NextResponse.json(
    (await db.selectDistinct({ genre: genres.genre, count: count(genres.genre) }).from(genres).groupBy(genres.genre))
      .sort((a, b) => a.genre.localeCompare(b.genre))
  )
}
