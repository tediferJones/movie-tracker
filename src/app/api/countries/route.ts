import { db } from '@/drizzle/db';
import { countries } from '@/drizzle/schema';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const country = new URL(req.url).searchParams.get('country');

  if (country) {
    const countryRecs = (
      await db.select({ imdbId: countries.imdbId }).from(countries).where(
        eq(countries.country, country)
      )
    );
    return NextResponse.json(
      await getManyExistingMedia(countryRecs.map(rec => rec.imdbId))
    );
  }

  return NextResponse.json(
    (await db.selectDistinct({ country: countries.country, count: count(countries.country) }).from(countries).groupBy(countries.country))
      .sort((a, b) => a.country.localeCompare(b.country))
  )
}
