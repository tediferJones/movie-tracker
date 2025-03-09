import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import getExistingMedia from '@/lib/getExistingMedia';
import { isValid } from '@/lib/inputValidation';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const imdbId = searchParams.get('imdbId');
  const listname = searchParams.get('listname');
  
  if (listname && !isValid({ listname })) {
    return NextResponse.json('inputs are not valid', { status: 422 })
  }

  // use .limit(num).offset(num) for paging
  // where limit = pageSize and offset = startCount
  // return NextResponse.json({
  //   allMediaInfo: !listname ? undefined : await Promise.all(
  //     (await db.select({ imdbId: lists.imdbId }).from(lists).where(
  //       and(
  //         eq(lists.username, username || user.username),
  //         eq(lists.listname, listname),
  //       )
  //     ).limit(25)).map(async rec => getExistingMedia(rec.imdbId))
  //   ),
  // })

  // we need to replace getExistingMedia call with one big query,
  // if we have 300 imdbIds, that will turn into 1000+ db queries
  // NEW QUERY: await db.select().from(myTable).where(inArray(myTable.id, ids));
  //
  // if (!listname) throw Error('no listname')
  // let listResult = []
  // try {
  //   const dbResult = await db.select({ imdbId: lists.imdbId }).from(lists).where(
  //     and(
  //       eq(lists.username, username || user.username),
  //       eq(lists.listname, listname)
  //     )
  //   )
  //   return NextResponse.json(dbResult.map(rec => rec.imdbId))
  //   // console.log('got db result', dbResult.length)
  //   // for (let i = 0; i < dbResult.length; i++) {
  //   //   console.log(i)
  //   //   listResult.push(await getExistingMedia(dbResult[i].imdbId))
  //   // }
  //   // THIS IS WHERE THE PROBLEM IS, WE NEED TO DO THIS MORE EFFICIENTLY
  //   // do something like this for each table, then aggregate data by id
  //   // const records = await db.select().from(myTable).where(inArray(myTable.id, ids));

  //   // listResult = await Promise.all(dbResult.map(async rec => getExistingMedia(rec.imdbId)))
  //   console.log('processed db result')
  // } catch {
  //   console.log('db req failed')
  //   return NextResponse.json('db req failed', { status: 500 })
  // }
  // return NextResponse.json({ allMediaInfo: listResult })

  // We need to be able to do a few things:
  //  - Return all list names
  //  - If imdbId is given, return all list names that contain imdbId
  //  - If listname is given, get all media info for listname and either specified user or self
  // WORKING
  return NextResponse.json({
    allListnames: (
      await db.select({ listname: listnames.listname }).from(listnames)
      .where(eq(listnames.username, username || user.username))
    ).map(rec => rec.listname),
    containsImdbId: !imdbId ? undefined : (
      await db.select({ listname: lists.listname }).from(lists).where(
        and(
          eq(lists.username, username || user.username),
          eq(lists.imdbId, imdbId)
        )
      )
    ).map(rec => rec.listname),
    allMediaInfo: !listname ? undefined : await Promise.all(
      (await db.select({ imdbId: lists.imdbId }).from(lists).where(
        and(
          eq(lists.username, username || user.username),
          eq(lists.listname, listname),
        )
      )).map(async rec => getExistingMedia(rec.imdbId))
    ),
    defaultList: (
      await db.select({ listname: listnames.listname }).from(listnames).where(
        and(
          eq(listnames.username, username || user.username),
          eq(listnames.defaultList, true)
        )
      ).get()
    )?.listname,
  })
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, listname } = await req.json();
  if (!imdbId || !listname) return NextResponse.json('Bad request', { status: 400 })

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  const listExists = await db.select().from(listnames).where(
    and(
      eq(listnames.username, user.username),
      eq(listnames.listname, listname)
    )
  ).get();
  if (!listExists) {
    await db.insert(listnames).values({
      username: user.username,
      listname: listname,
      defaultList: false,
    })
  }

  await db.insert(lists).values({
    imdbId,
    listname,
    username: user.username,
  })

  return new NextResponse
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { listname } = await req.json();
  if (!listname) return NextResponse.json('Bad request', { status: 400 })

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  await db.update(listnames).set({ defaultList: false }).where(eq(listnames.username, user.username))
  await db.update(listnames).set({ defaultList: true }).where(
    and(
      eq(listnames.username, user.username),
      eq(listnames.listname, listname),
    )
  )

  return new NextResponse
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, listname } = await req.json();
  if (!listname) return NextResponse.json('Bad request', { status: 400 })

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  if (!imdbId) {
    // Table is setup so that this should automatically cascade the delete in lists table
    await db.delete(listnames).where(
      and(
        eq(listnames.username, user.username),
        eq(listnames.listname, listname),
      )
    );
    return new NextResponse;
  }

  await db.delete(lists).where(
    and(
      eq(lists.username, user.username),
      eq(lists.listname, listname),
      eq(lists.imdbId, imdbId),
    )
  )

  const listContents = await db.select().from(lists).where(
    and(
      eq(lists.username, user.username),
      eq(lists.listname, listname),
    )
  ).get();
  if (!listContents) {
    db.delete(listnames).where(
      and(
        eq(lists.username, user.username),
        eq(lists.listname, listname)
      )
    )
  }

  return new NextResponse
}
