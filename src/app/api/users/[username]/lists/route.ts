import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // return all listnames
  // if url has imdbId param, return listnames for lists that contain imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url)

  try {
    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!
      const cacheStr = `${username},${imdbId},lists`
      if (!cache.get(cacheStr)) {
        const listnames = await db.select({ listname: lists.listname }).from(lists).where(
          and(
            eq(lists.imdbId, imdbId),
            eq(lists.username, username),
          )
        )
        cache.set(cacheStr, listnames.map(listRec => listRec.listname))
      }
      return NextResponse.json(cache.get(cacheStr))
    } else {
      const cacheStr = `${username},lists`
      if (!cache.get(cacheStr)) {
        const listRecs = await db.select().from(listnames).where(
          eq(listnames.username, username)
        )
        cache.set(cacheStr, listRecs.map(listRec => listRec.listname))
      }
      return NextResponse.json(cache.get(cacheStr))
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
