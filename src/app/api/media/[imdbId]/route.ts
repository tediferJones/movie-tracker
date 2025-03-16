import { db } from '@/drizzle/db';
import { media } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  console.log('got request for imdbId:', imdbId)

  cache['shareCheck'] = { data: 'wow', date: Date.now() }
  console.log('set shareCheck', cache['shareCheck'])
  if (cache[imdbId]) {
    console.log('USING CACHE')
    return NextResponse.json(cache[imdbId].data)
  }

  console.log('not in cache, looking up')
  const dbResult = await db.select().from(media).where(eq(media.imdbId, imdbId)).get()
  if (!dbResult) throw Error('media not found')
  cache[imdbId] = { data: dbResult, date: Date.now() }
  return NextResponse.json(dbResult)
}
