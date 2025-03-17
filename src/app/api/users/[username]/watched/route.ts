import { db } from '@/drizzle/db';
import { media, watched } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // get all watched records for a given user
  // if urlParams has imdbId, only return records related to that imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url);

  try {
    if (searchParams.has('imdbId')) {
      console.log('get watched from imdbId')
      const imdbId = searchParams.get('imdbId')!;
      const cacheStr = `${username},${imdbId},watched`
      if (!cache.get(cacheStr)) {
        console.log(cacheStr, 'not in cache')
        cache.set(cacheStr,
          await db.select().from(watched).where(
            and(
              eq(watched.username, username),
              eq(watched.imdbId, imdbId),
            )
          )
        )
      }
      return NextResponse.json(cache.get(cacheStr));
    } else {
      const cacheStr = `${username},watched`
      if (!cache.get(cacheStr)) {
        cache.set(cacheStr, db.select().from(watched).where(eq(watched.username, username)))
      }
      return NextResponse.json(cache.get(cacheStr));
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  // add watched record for user and imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser()
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!searchParams.has('imdbId')) {
    return NextResponse.json('Bad request, no imdbId', { status: 400 });
  }

  const imdbId = searchParams.get('imdbId')!;
  const imdbIdExists = db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (!imdbIdExists) {
    return NextResponse.json('ImdbId not found', { status: 404 });
  }

  try {
    await db.insert(watched).values({ username, imdbId, date: Date.now() });
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // Delete watch record for a given user and id
  const { username } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser()
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!searchParams.has('id')) {
    return NextResponse.json('Bad request, no id', { status: 400 });
  }

  const id = searchParams.get('id')!
  try {
    await db.delete(watched).where(
      and(
        eq(watched.username, username),
        eq(watched.id, Number(id)),
      )
    );
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
