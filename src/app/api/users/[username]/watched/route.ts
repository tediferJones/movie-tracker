import { db } from '@/drizzle/db';
import { media, watched } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // get all watched records for a given user
  // if urlParams has imdbId, only return records related to that imdbId
  const { username } = params;
  const imdbId = new URLSearchParams(req.url).get('imdbId');

  const whereCondition = imdbId ? and(
    eq(watched.username, username),
    eq(watched.imdbId, imdbId),
  ) : eq(watched.username, username);

  try {
    return NextResponse.json(await db.select().from(watched).where(whereCondition));
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  // add watched record for user and imdbId
  const { username } = params;
  const imdbId = new URLSearchParams(req.url).get('imdbId');

  const user = await currentUser()
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!imdbId) {
    return NextResponse.json('Bad request, no imdbId', { status: 400 });
  }

  const imdbIdExists = db.select().from(media).where(eq(media.imdbId, imdbId)).get();
  if (!imdbIdExists) {
    return NextResponse.json('ImdbId not found', { status: 404 });
  }

  try {
    await db.insert(watched).values({ username, imdbId, date: Date.now() });
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { username } = params;
  const id = new URLSearchParams(req.url).get('id');

  const user = await currentUser()
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!id) {
    return NextResponse.json('Bad request, no id', { status: 400 });
  }

  try {
    await db.delete(watched).where(eq(watched.id, Number(id)));
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
