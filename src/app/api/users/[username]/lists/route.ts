import { db } from '@/drizzle/db';
import { listnames, lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string }

// /api/users/[username]/lists
// GET: get all listnames and default list
// POST/PUT: change default listname
//
// /api/users/[username]/lists/[listname]
// [ DONE ] GET: get list contents and all associated media data
// [ DONE ] POST: create new list with listname
// [ DONE ] PUT: change listname (new listname in URL or body)
// [ DONE ] DELETE: remove list (remove from listnames table and make sure all list data for listname is removed from lists table)
//
// /api/users/[username]/lists/[listname]/[imdbId]
// [ DONE ] POST: add imdbId to list
// PUT: bump imdbId in list
// [ DONE ] DELETE: remove imdbId from list

export async function GET(req: Request, { params }: { params: Params }) {
  // return all listnames and default listname
  // if url has imdbId param, return listnames for lists that contain imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url)

  try {
    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!
      const listnames = await db.select({ listname: lists.listname }).from(lists).where(
        and(
          eq(lists.imdbId, imdbId),
          eq(lists.username, username),
        )
      )
      return NextResponse.json(listnames.map(listRec => listRec.listname))
    } else {
      const listRecs = await db.select().from(listnames).where(
        eq(listnames.username, username)
      )
      return NextResponse.json({
        listnames: listRecs.map(listRec => listRec.listname),
        defaultList: listRecs.find(listRec => listRec.defaultList)?.listname
      })
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

// export async function POST(req: Request, { params }: { params: Params }) {
//   // create new lists here
//   // new listname should be in req body
//   // const { username } = params;
// 
//   // const { listname } = await req.json()
// }

// export async function PUT(req: Request, { params }: { params: Params }) {
// 
// }
