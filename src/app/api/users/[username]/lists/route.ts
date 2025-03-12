import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string }

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

export async function POST(req: Request, { params }: { params: Params }) {
  // create new lists here
  // new listname should be in req body
  // const { username } = params;

  // const { listname } = await req.json()
}

// no PUT or DELETE methods here
