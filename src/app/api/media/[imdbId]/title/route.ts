import { db } from '@/drizzle/db';
import { media } from '@/drizzle/schema';
import cache from '@/lib/cache';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { imdbId: string }

// this is kind of a bad idea,
// for components like watchedDisplay, we could end up sendings hundreds of requests
export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  const cacheStr = `${imdbId},title`;

  if (!cache.get(cacheStr)) {
    if (cache.get(imdbId)) {
      cache.set(cacheStr, cache.get(imdbId).title);
    } else {
      try {
        const mediaRec = await db.select({ title: media.title }).from(media).where(
          eq(media.imdbId, imdbId)
        ).get();
        if (!mediaRec) {
          return NextResponse.json('ImdbId not found', { status: 404 });
        }
        cache.set(cacheStr, mediaRec?.title);
      } catch {
        return NextResponse.json('Failed to process request, database error', { status: 500 });
      }
    }
  }
  return NextResponse.json(cache.get(cacheStr));
}
