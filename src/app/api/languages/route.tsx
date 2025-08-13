import { db } from '@/drizzle/db';
import { languages } from '@/drizzle/schema';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const language = new URL(req.url).searchParams.get('language');

  if (language) {
    const languageRecs = (
      await db.select({ imdbId: languages.imdbId }).from(languages).where(
        eq(languages.language, language)
      )
    );
    return NextResponse.json(
      await getManyExistingMedia(languageRecs.map(rec => rec.imdbId))
    );
  }

  return NextResponse.json(
    (await db.selectDistinct({ language: languages.language, count: count(languages.language) }).from(languages).groupBy(languages.language))
      .sort((a, b) => a.language.localeCompare(b.language))
  )
}
