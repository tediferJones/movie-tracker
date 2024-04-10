import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import getExistingMedia from '@/lib/getExistingMedia';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const imdbId = searchParams.get('imdbId');
  const listname = searchParams.get('listname');

  // We need to be able to do a few things:
  //  - Return all list names
  //  - If imdbId is given, return all list names that contain imdbId
  //  - If listname is given, get all media info for listname and either specified user or self
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

  // const imdbId = searchParams.get('imdbId');
  // if (imdbId) {
  //   return NextResponse.json(
  //     await db.select().from(lists).where(
  //       and(
  //         eq(lists.username, user.username),
  //         eq(lists.imdbId, imdbId),
  //       )
  //     )
  //   )
  // }

  // const listname = searchParams.get('listname');
  // const username = searchParams.get('username');
  // if (listname && username) {
  //   return NextResponse.json(
  //     await Promise.all(
  //       (await db.select().from(lists).where(
  //         and(
  //           eq(lists.username, username),
  //           eq(lists.listname, listname),
  //         )
  //       )).map(async rec => await getExistingMedia(rec.imdbId))
  //     )
  //   )
  // }

  // return NextResponse.json('Bad request', { status: 400 });
}

// const imdbId = new URL(req.url).searchParams.get('imdbId')
// if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

// return NextResponse.json(
//   await db.select().from(lists).where(
//     and(
//       eq(lists.username, user.username),
//       eq(lists.imdbId, imdbId),
//     )
//   )
// )

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, listname } = await req.json();
  if (!imdbId || !listname) return NextResponse.json('Bad request', { status: 400 })

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
  if (!imdbId || !listname) return NextResponse.json('Bad request', { status: 400 })

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
