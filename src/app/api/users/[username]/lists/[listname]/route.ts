import { db } from '@/drizzle/db';
import { listnames, lists, media } from '@/drizzle/schema';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { isValid } from '@/lib/inputValidation';
import { currentUser } from '@clerk/nextjs';
import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { serverHashCache } from '@/lib/hashCacheV4';
import { serverHashCacheV5 } from '@/lib/hashCacheV5';

type Params = { username: string, listname: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // Get full media data for every item in list
  const { username, listname } = params;

  const { searchParams } = new URL(req.url);
  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const listId = Number(listname);
    const listRecords = await db.select().from(lists).where(
      eq(lists.listnameId, listId),
    );
    await serverHashCacheV5.update(
      username,
      listRecords,
      'GET',
      'listContents',
      listId.toString()
    );
    // await serverHashCache.updateHash(
    //   username,
    //   'listContents',
    //   // ['listContents', listId],
    //   'GET',
    //   listRecords as any,
    //   listId.toString(),
    // );
    return NextResponse.json(listRecords);
  }
  
  const cacheStr = `${username},${listname}`;
  if (!cache.get(cacheStr)) {
    try {
      const listRecords = await db.select().from(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listname, listname),
        )
      ).orderBy(desc(lists.date));

      const listData = await getManyExistingMedia(listRecords.map(rec => rec.imdbId));
      cache.set(cacheStr, listData);
    } catch {
      return NextResponse.json('Failed to process request, database error', { status: 500 });
    }
  }

  return NextResponse.json(cache.get(cacheStr));
}

export async function POST(req: Request, { params }: { params: Params }) {
  // create new list with listname
  // if req has imdbId param, also add imdbId to listname
  const { username, listname } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const valid = isValid({ listname });
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 });

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    if (!searchParams.get('imdbId')) throw Error('no imdbId');
    if (!searchParams.get('listId')) throw Error('no listId');
    if (!searchParams.get('listname')) throw Error('no listname');
    const imdbId = searchParams.get('imdbId')!;
    const listId = searchParams.get('listId')!;
    const listname = searchParams.get('listname')!;
    const newRecord = {
      username,
      listname,
      imdbId,
      date: Date.now(),
      listnameId: Number(listId),
    }
    console.log('INSERTING', newRecord)
    console.log(cache.cache)
    await db.insert(lists).values(newRecord);
    const newRecordV2 = cache.get(imdbId);
    if (!newRecordV2) throw Error('cannot find media info');
    await serverHashCache.updateHash(
      username,
      // `list-${listId}`,
      // ['listContents', listId],
      'listContents',
      'POST',
      newRecordV2,
      listId.toString(),
    );
    cache.delete(`${username},${imdbId},lists`);
    cache.delete(`${username},${listname}`);
    return NextResponse.json(newRecord);
  }

  try {
    const alreadyExists = await db.select().from(listnames).where(
      and(
        eq(listnames.username, username),
        eq(listnames.listname, listname),
      )
    ).get();

    if (!alreadyExists) {
      // if list doesnt exist, create it
      await db.insert(listnames).values({
        username,
        listname,
        defaultList: false,
        date: Date.now(),
      });
      cache.delete(`${username},lists`);
    }

    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!;

      // FIX ME
      // this should probably just be handled by foreign keys
      // const imdbIdExists = await db.select().from(media).where(
      //   eq(media.imdbId, imdbId)
      // ).get();
      // if (!imdbIdExists) {
      //   return NextResponse.json('ImdbId does not exist in media table', { status: 400 });
      // }

      // Probably dont need this either
      // const alreadyInList = await db.select().from(lists).where(
      //   and(
      //     eq(lists.username, username),
      //     eq(lists.listname, listname),
      //     eq(lists.imdbId, imdbId),
      //   )
      // ).get();
      // if (!alreadyInList) {
      //   await db.insert(lists).values({
      //     username,
      //     listname,
      //     imdbId,
      //     date: Date.now(),
      //   });
      //   // cache.delete(`${username},${imdbId},lists`);
      //   // cache.delete(`${username},${listname}`);
      // } else {
      //   // if imdbID already exists in list, then we "bump" the list item by updating the record's date column
      //   // It might make more sense to move this to a different route
      //   // maybe create a new route like /api/users/${username}/lists/${listname}/items/${imdbId}
      //   // POST could add records
      //   // PUT/PATCH could bump records
      //   await db.update(lists).set({ date: Date.now() }).where(
      //     and(
      //       eq(lists.username, username),
      //       eq(lists.listname, listname),
      //       eq(lists.imdbId, imdbId)
      //     )
      //   );
      //   // cache.delete(`${username},${imdbId},lists`);
      //   // cache.delete(`${username},${listname}`);
      // }

      const listnameRec = await db.select().from(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      ).get();
      if (!listnameRec) throw Error('could not find listnameRec');

      await db.insert(lists).values({
        username,
        listname,
        imdbId,
        date: Date.now(),
        listnameId: listnameRec.id,
      });
      cache.delete(`${username},${imdbId},lists`);
      cache.delete(`${username},${listname}`);
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
  const { newListname } = await req.json();
  
  if (!newListname) {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (listname === newListname) {
    return new NextResponse();
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
    cache.set(`${username},${newListname}`, cache.get(`${username},${listname}`));
    cache.delete(`${username},${listname}`);
    cache.delete(`${username},lists`);

    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // delete entire list
  // if req has imdbId param, only delete imdbId from list
  const { username, listname } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const imdbId = searchParams.get('imdbId');
    const listId = searchParams.get('listId');
    if (!imdbId) throw Error('could not get imdbId param');
    if (!listId) throw Error('could not get listId param');
  console.log('DELETE', username, listname, imdbId)
    const temp = await db.delete(lists).where(
      and(
        eq(lists.username, username),
        eq(lists.listnameId, Number(listname)),
        eq(lists.imdbId, imdbId)
      )
    );
    console.log('DELETED', temp.rowsAffected)
    serverHashCacheV5.update(username, { imdbId }, 'DELETE', 'listContents', listId);
    cache.delete(`${username},${imdbId},lists`);
    cache.delete(`${username},${listname}`);
    return NextResponse.json({ imdbId });
  }

  try {
    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!;
      await db.delete(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listname, listname),
          eq(lists.imdbId, imdbId)
        )
      );
      cache.delete(`${username},${imdbId},lists`);
      cache.delete(`${username},${listname}`);
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
      cache.delete(`${username},lists`);
      cache.delete(`${username},${listname}`);
    }
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { username, listname } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const valid = isValid({ listname });
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 });
  
  if (!searchParams.has('imdbId')) {
    return NextResponse.json('Bad Request', { status: 400 });
  }
  const imdbId = searchParams.get('imdbId')!;

  try {
    await db.update(lists).set({ date: Date.now() }).where(
      and(
        eq(lists.username, username),
        eq(lists.listname, listname),
        eq(lists.imdbId, imdbId)
      )
    );
    cache.delete(`${username},${imdbId},lists`);
    cache.delete(`${username},${listname}`);

    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
