import { db } from '@/drizzle/db';
import { media, watched } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs';
import { and,/* count,*/ desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { hashTable } from '@/lib/hashCache';
import { serverHashCacheV5 } from '@/lib/hashCacheV5';

type Params = { username: string }

function addTitle(records: { imdbId: string }[]) {
  return records.map((watchRec: typeof records[number] & { title?: string }) => {
    watchRec.title = cache.get(watchRec.imdbId).title;
    if (!watchRec.title) {
      console.log('cant find title')
      throw Error('could not find title');
    }
    return watchRec;
  })
}

// FIX ME
// async function getCount(cacheStr: string, query: Function) {
//   // this is being added to the cache, so anytime watch records are modified, it needs to be cleared
//   const cacheStrCount = `${cacheStr},count`;
//   if (!cache.get(cacheStrCount)) {
//     cache.set(cacheStrCount, await query());
//   }
//   return cache.get(cacheStrCount);
// }

export async function GET(req: Request, { params }: { params: Params }) {
  // get all watched records for a given user
  // if urlParams has imdbId, only return records related to that imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url);

  // TESTING
  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const watchRecs = await db.select().from(watched).where(
      eq(watched.username, username)
    ).orderBy(desc(watched.date));

    await getManyExistingMedia(watchRecs.map(watchRec => watchRec.imdbId));

    // FIX ME, this is just ugly and needs to be simplified
    const result = watchRecs.map((watchRec: typeof watchRecs[number] & { title?: string }) => {
      watchRec.title = cache.get(watchRec.imdbId).title;
      if (!watchRec.title) throw Error('could not find title');
      return watchRec;
    }) as (typeof watchRecs[number] & { title: string })[];

    await serverHashCacheV5.update(req, username, result, 'GET', 'watched');
    return NextResponse.json(result);
  }

  try {
    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!;
      const cacheStr = `${username},${imdbId},watched`;
      if (!cache.get(cacheStr)) {
        cache.set(cacheStr,
          await db.select().from(watched).where(
            and(
              eq(watched.username, username),
              eq(watched.imdbId, imdbId),
            )
          ).orderBy(desc(watched.date))
        );
      }
      return NextResponse.json(cache.get(cacheStr));
    } else {
      const cacheStr = `${username},watched`;
      if (!cache.get(cacheStr)) {
        const watchRecs = await db.select().from(watched).where(
          eq(watched.username, username)
        ).orderBy(desc(watched.date));

        await getManyExistingMedia(watchRecs.map(watchRec => watchRec.imdbId));

        cache.set(cacheStr, watchRecs.map((watchRec: typeof watchRecs[number] & { title?: string }) => {
          watchRec.title = cache.get(watchRec.imdbId).title;
          if (!watchRec.title) throw Error('could not find title');
          return watchRec;
        }));
      }
      return NextResponse.json(cache.get(cacheStr));

      // FIX ME
      // This was for paging, but if we go the route of stateManagement this can be deleted
      // if (searchParams.has('page') && searchParams.has('limit')) {
      //   const page = Number(searchParams.get('page'));
      //   const limit = Number(searchParams.get('limit'));
      //   const dbResult = (
      //     await db.select().from(watched).where(eq(watched.username, username))
      //     .orderBy(desc(watched.date))
      //     .limit(limit)
      //     .offset((page - 1) * limit)
      //   );
      //   return NextResponse.json({
      //     result: addTitle(dbResult),
      //     total: await getCount(cacheStr, async () => {
      //       return (await db.select({ count: count() }).from(watched).where(
      //         eq(watched.username, username)
      //       ))[0].count;
      //     })
      //   })
      // } else {
      //   return NextResponse.json(cache.get(cacheStr));
      // }
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

  // TESTING
  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const imdbId = searchParams.get('imdbId')!;
    console.log('POST WATCHED TEST', imdbId)
    const preInsertRecord = { username, imdbId, date: Date.now() };
    const { lastInsertRowid } = await db.insert(watched).values(preInsertRecord);
    const postInsertRecord = {
      id: Number(lastInsertRowid),
      title: cache.get(imdbId).title,
      ...preInsertRecord,
    }
    if (!postInsertRecord.title) throw Error('could not find title');
    // hashTable.updateResource(username, 'watched', 'POST', postInsertRecord)
    await serverHashCacheV5.update(req, username, postInsertRecord, 'POST', 'watched');
    cache.delete(`${username},${imdbId},watched`);
    cache.delete(`${username},watched`);
    return NextResponse.json(postInsertRecord);
  }

  const imdbId = searchParams.get('imdbId')!;
  const imdbIdExists = db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (!imdbIdExists) {
    return NextResponse.json('ImdbId not found', { status: 404 });
  }

  try {
    await db.insert(watched).values({ username, imdbId, date: Date.now() });
    cache.delete(`${username},${imdbId},watched`);
    cache.delete(`${username},watched`);
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // Delete watch record for a given user and id
  const { username } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!searchParams.has('id')) {
    return NextResponse.json('Bad request, no id', { status: 400 });
  }

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const id = Number(searchParams.get('id'));
    await db.delete(watched).where(
      and(
        eq(watched.username, username),
        eq(watched.id, id),
      )
    );
    // hashTable.updateResource(username, 'watched', 'DELETE', { id })
    await serverHashCacheV5.update(req, username, { id }, 'DELETE', 'watched');
    return NextResponse.json({ id })
  }

  if (!searchParams.has('imdbId')) {
    return NextResponse.json('Bad request, no imdbId', { status: 400 });
  }

  const id = searchParams.get('id')!;
  const imdbId = searchParams.get('imdbId')!;
  try {
    await db.delete(watched).where(
      and(
        eq(watched.username, username),
        eq(watched.id, Number(id)),
      )
    );
    cache.delete(`${username},${imdbId},watched`);
    cache.delete(`${username},watched`);
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
