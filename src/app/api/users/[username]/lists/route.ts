import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
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
  const { username } = params;

  const dbResult = await db.select({
    listname: listnames.listname,
    default: listnames.defaultList
  }).from(listnames).where(eq(listnames.username, username));

  return NextResponse.json({
    listnames: dbResult.map(listRec => listRec.listname),
    defaultList: dbResult.find(listRec => listRec.default)?.listname,
  });
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
