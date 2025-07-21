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

  await db.insert(listnames).values(newRecord);
  // await hashTable.updateResource(username, 'listnames', 'POST', newRecord);
  return NextResponse.json(newRecord);
}

export async function PUT(req: Request, { params }: { params: Params }) {
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
  const listnameValid = isValid({ listname });
  if (!listnameValid) return NextResponse.json('listname is not valid', { status: 422 });
  
  const newListname = searchParams.get('newListname');
  if (!newListname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }
  const newListnameValid = isValid({ listname: newListname });
  if (!newListnameValid) return NextResponse.json('new listname is not valid', { status: 422 });

  await db.update(listnames).set({ listname: newListname }).where(
    and(
      eq(listnames.username, username),
      eq(listnames.listname, listname),
    )
  );
  await hashTable.updateResource(username, 'listnames', 'PUT', { listname, newListname });
  return NextResponse.json({ listname, newListname });
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { username} = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const listname = searchParams.get('listname')
  if (!listname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  const valid = isValid({ listname });
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 });
  
  console.log('DELETING', listname)
  // listnames will apparently cascade and delete all records in lists table with associated name
  await db.delete(listnames).where(
    and(
      eq(listnames.username, username),
      eq(listnames.listname, listname),
    )
  );
  console.log('SUCCESSFULLY DELETED')
  await hashTable.updateResource(username, 'listnames', 'DELETE', { listname })
  return NextResponse.json({ listname })
}
