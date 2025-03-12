import { db } from '@/drizzle/db';
import { lists } from '@/drizzle/schema';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string, listname: string }

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

export async function POST() {
  // add record to listname
}

// use PUT /users/[username]/lists/[listname]/default to set default lists
export async function PUT() {
  // list bump feature?
}

export async function DELETE() {
  // delete entire list
}
