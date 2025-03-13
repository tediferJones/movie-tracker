import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { isValid } from '@/lib/inputValidation';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string, listname: string }

// IGNORE THIS, refer to src/app/api/users/[username]/lists/route.ts
// /api/users/[username]/lists
//  - GET: Get all listnames and default listname
//
// /api/users/[username]/lists/[listname]
//  - GET: Get contents of listname
//  - POST: Create new list
//  - PUT: Update listname?
//  - DELETE: Delete list
//
// /api/users/[username]/lists/[listname]/defaultList
//  - POST: Set listname as defaultList
// /api/users/[username]/lists/[listname]/contents (imdbId in req body)
//  - POST: add item to list
//  - DELETE: delete item from list
//  - PUT: Bump to top of list?

export async function GET(req: Request, { params }: { params: Params }) {
  // Get full media data for every item in list
  const { username, listname } = params;

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

  return NextResponse.json(listData)
}

export async function POST(req: Request, { params }: { params: Params }) {
  // create new list
  const { username, listname } = params

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  try {
    const alreadyExists = await db.select().from(listnames).where(
      and(
        eq(listnames.username, username),
        eq(listnames.listname, listname),
      )
    ).get()
    if (alreadyExists) {
      return NextResponse.json('Listname already exists', { status: 409 })
    }

    await db.insert(listnames).values({ username, listname, defaultList: false })
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 })
  }

  return new NextResponse
}

// use PUT /users/[username]/lists/[listname]/default to set default lists
export async function PUT(req: Request, { params }: { params: Params }) {
  // update listname
  const { username, listname } = params
  const newListname = await req.json()
  
  if (!newListname) {
    return NextResponse.json('Bad Request', { status: 400 })
  }

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  const valid = isValid({ listname })
  if (!valid) return NextResponse.json('inputs are not valid', { status: 422 })

  try {
    await db.update(listnames).set({ listname: newListname }).where(
      and(
        eq(listnames.username, username),
        eq(listnames.listname, listname),
      )
    )

    await db.update(lists).set({ listname: newListname }).where(
      and(
        eq(lists.username, username),
        eq(lists.listname, listname),
      )
    )
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 })
  }

  return new NextResponse
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // delete entire list
  const { username, listname } = params

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  try {
    await db.delete(listnames).where(
      and(
        eq(listnames.username, username),
        eq(listnames.listname, listname),
      )
    )
    await db.delete(lists).where(
      and(
        eq(lists.username, username),
        eq(lists.listname, listname),
      )
    )
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 })
  }

  return new NextResponse
}
