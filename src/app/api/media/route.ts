import { media, } from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';

export async function GET() {
  const mediaRecs = (
    await db.select().from(media).orderBy(desc(media.updatedAt)).all()
  );
  const allMediaInfo = (
    await getManyExistingMedia(mediaRecs.map(rec => rec.imdbId))
  );
  return NextResponse.json(allMediaInfo);
}
