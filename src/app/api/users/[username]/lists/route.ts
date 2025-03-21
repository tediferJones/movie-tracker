import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { currentUser } from '@clerk/nextjs';
import { isValid } from '@/lib/inputValidation';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // return all listnames and default listname
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
        cache.set(cacheStr, {
          listnames: listRecs.map(listRec => listRec.listname),
          defaultList: listRecs.find(listRec => listRec.defaultList)?.listname
        });
      }
      return NextResponse.json(cache.get(cacheStr))
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  // update default list
  // if there is no newDefaultListname param, only remove old defaultListname
  const { username } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  try {
    await db.update(listnames).set({ defaultList: false }).where(
      and(
        eq(listnames.username, username),
        eq(listnames.defaultList, true)
      )
    );
    cache.delete(`${username},lists`)
    if (searchParams.has('newDefaultListname')) {
      const newDefaultListname = searchParams.get('newDefaultListname')!;
      const valid = isValid({ listname: newDefaultListname });
      if (!valid) return NextResponse.json('Inputs are not valid', { status: 422 });

      await db.update(listnames).set({ defaultList: true }).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, newDefaultListname),
        )
      );
    }
    return new NextResponse()
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
