import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  const cacheStr = `${imdbId},reviews`;
  if (!cache.get(cacheStr)) {
    try {
      cache.set(cacheStr, 
        await db.select().from(reviews).where(
          eq(reviews.imdbId, imdbId)
        ).orderBy(desc(reviews.date))
      );
    } catch {
      return NextResponse.json('Failed to process request, database error', { status: 500 });
    }
  }

  return NextResponse.json(cache.get(cacheStr));
}
