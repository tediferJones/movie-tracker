import { db } from '@/drizzle/db';
import { languages } from '@/drizzle/schema';
import getExistingMedia from '@/lib/getExistingMedia';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const language = new URL(req.url).searchParams.get('language');

  if (language) {
    return NextResponse.json(
      await Promise.all(
        (await db.select({ imdbId: languages.imdbId }).from(languages).where(eq(languages.language, language)))
          .map(async rec => await getExistingMedia(rec.imdbId))
      )
    )
  }

  return NextResponse.json(
    (await db.selectDistinct({ language: languages.language, count: count(languages.language) }).from(languages).groupBy(languages.language))
      .sort((a, b) => a.language.localeCompare(b.language))
  )
}
