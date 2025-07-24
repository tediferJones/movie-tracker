import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { hashTable } from '@/lib/hashCache';
import { currentUser } from '@clerk/nextjs';
import { isValid } from '@/lib/inputValidation';
import { serverHashCache } from '@/lib/hashCacheV4';
import { serverHashCacheV5 } from '@/lib/hashCacheV5';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // return all listnames
  // if url has imdbId param, return listnames for lists that contain imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url)

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const listnameRecs = await db.select().from(listnames).where(
      eq(listnames.username, username)
    );
    // hashTable.setResource(username, 'listnames', listnameRecs);
    // await serverHashCache.updateHash(username, ['listnames'], 'GET', listnameRecs);
    await serverHashCacheV5.update(req, username, listnameRecs, 'GET', 'listnames');
    return NextResponse.json(listnameRecs);
  }

  // this makes absolutely no sense,
  // why are we scanning listnames from the lists table?
  // there will be loads of duplicates
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

export async function POST(req: Request, { params }: { params: Params }) {
  const { username} = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const listname = searchParams.get('listname');
  if (!listname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  const valid = isValid({ listname });
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 });

  const newRecord = {
    username,
    listname,
    defaultList: false,
    date: Date.now(),
  }

  const { lastInsertRowid } = await db.insert(listnames).values(newRecord);
  const withId = {
    ...newRecord,
    id: Number(lastInsertRowid),
  }
  await serverHashCacheV5.update(req, username, withId, 'POST', 'listnames');
  return NextResponse.json(withId);
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { username} = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const listId = searchParams.get('id');
  if (!listId) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  const listname = searchParams.get('listname');
  if (!listname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }
  const listnameValid = isValid({ listname });
  if (!listnameValid) return NextResponse.json('listname is not valid', { status: 422 });
  
  const newListname = searchParams.get('newListname');
  if (!newListname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }
  const newListnameValid = isValid({ listname: newListname });
  if (!newListnameValid) return NextResponse.json('new listname is not valid', { status: 422 });

  const result = await db.update(listnames).set({ listname: newListname }).where(
    and(
      eq(listnames.username, username),
      eq(listnames.listname, listname),
    )
  );
  console.log('UPDATED', result);
  // await hashTable.updateResource(username, 'listnames', 'PUT', { listname, newListname });
  const newRecord = await db.select().from(listnames).where(
    and(
      eq(listnames.username, username),
      eq(listnames.listname, listname),
    )
  ).get();
  if (!newRecord) throw Error('PUT used on record that does not exist')
  await serverHashCacheV5.update(req, username, newRecord, 'PUT', 'listnames');

  return NextResponse.json(newRecord);
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { username} = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const id = Number(searchParams.get('id'))
  if (!id) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  console.log('DELETING', id)
  // listnames will apparently cascade and delete all records in lists table with associated name
  await db.delete(listnames).where(
    and(
      eq(listnames.username, username),
      eq(listnames.id, id),
    )
  );
  console.log('SUCCESSFULLY DELETED')
  // await hashTable.updateResource(username, 'listnames', 'DELETE', { listname })
  await serverHashCacheV5.update(req, username, { id }, 'DELETE', 'listnames');
  return NextResponse.json({ id });
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { username} = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const listname = searchParams.get('listname');
  if (!listname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }
  const set = searchParams.get('set');
  if (!set) {
    return NextResponse.json('Bad Request', { status: 400 });
  }
  
  type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never
  }[keyof T]
  const booleans = {
    defaultList: false
  } satisfies { [K in BooleanKeys<typeof listnames.$inferSelect>]: false }

  if (!(set in booleans)) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  await db.update(listnames).set({ [set]: false, }).where(
    eq(listnames.username, username)
  )

  await db.update(listnames).set({ [set]: true }).where(
    and(
      eq(listnames.username, username),
      eq(listnames.listname, listname),
    )
  )
}
