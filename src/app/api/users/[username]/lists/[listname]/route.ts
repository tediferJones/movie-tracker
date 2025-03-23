import { db } from '@/drizzle/db';
import { listnames, lists, media } from '@/drizzle/schema';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { isValid } from '@/lib/inputValidation';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';

type Params = { username: string, listname: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // Get full media data for every item in list
  const { username, listname } = params;
  
  const cacheStr = `${username},${listname}`
  if (!cache.get(cacheStr)) {
    try {
      const listRecords = await db.select().from(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listname, listname),
        )
      )
      const imdbIds = listRecords.map(rec => rec.imdbId)

      if (!imdbIds.length) return NextResponse.json({
        error: 'No resources found',
        listname,
        username,
      }, { status: 404 })

      const listData = await getManyExistingMedia(imdbIds)
      cache.set(cacheStr, listData)
    } catch {
      return NextResponse.json('Failed to process request, database error', { status: 500 });
    }
  }

  return NextResponse.json(cache.get(cacheStr))
}

export async function POST(req: Request, { params }: { params: Params }) {
  // create new list with listname
  // if req has imdbId param, also add imdbId to listname
  const { username, listname } = params;
  const { searchParams } = new URL(req.url)

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const valid = isValid({ listname });
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 });

  try {
    const alreadyExists = await db.select().from(listnames).where(
      and(
        eq(listnames.username, username),
        eq(listnames.listname, listname),
      )
    ).get();

    if (!alreadyExists) {
      // if list doesnt exist, create it
      await db.insert(listnames).values({ username, listname, defaultList: false });
      cache.delete(`${username},lists`)
    }

    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!;

      const imdbIdExists = await db.select().from(media).where(
        eq(media.imdbId, imdbId)
      ).get()
      if (!imdbIdExists) {
        return NextResponse.json('ImdbId does not exist in media table', { status: 400 })
      }

      const alreadyInList = await db.select().from(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listname, listname),
          eq(lists.imdbId, imdbId),
        )
      ).get();
      if (!alreadyInList) {
        await db.insert(lists).values({ username, listname, imdbId });
        cache.delete(`${username},${imdbId},lists`)
        cache.delete(`${username},${listname}`)
      }
    }

    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

// use PUT /users/[username]/lists/[listname]/default to set default lists
// we still need to figure out how we want to bump list items, and set default list
export async function PUT(req: Request, { params }: { params: Params }) {
  // change listname
  const { username, listname } = params;
  const newListname = await req.json();
  
  if (!newListname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (listname === newListname) {
    return new NextResponse()
  }

  const valid = isValid({ listname: newListname });
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 });

  try {
    await db.update(listnames).set({ listname: newListname }).where(
      and(
        eq(listnames.username, username),
        eq(listnames.listname, listname),
      )
    );

    await db.update(lists).set({ listname: newListname }).where(
      and(
        eq(lists.username, username),
        eq(lists.listname, listname),
      )
    );
    cache.set(`${username},${newListname}`, cache.get(`${username},${listname}`))
    cache.delete(`${username},${listname}`)

    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // delete entire list
  // if req has imdbId param, only delete imdbId from list
  const { username, listname } = params;
  const { searchParams } = new URL(req.url)

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  try {
    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!
      await db.delete(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listname, listname),
          eq(lists.imdbId, imdbId)
        )
      )
      cache.delete(`${username},${imdbId},lists`)
      cache.delete(`${username},${listname}`)
    } else {
      await db.delete(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      );
      await db.delete(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listname, listname),
        )
      );
      cache.delete(`${username},lists`)
      cache.delete(`${username},${listname}`)
    }
    return new NextResponse
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
