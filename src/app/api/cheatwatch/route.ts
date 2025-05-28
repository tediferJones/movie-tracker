import { db } from '@/drizzle/db';
import { watched } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 });

  const { imdbId, date } = await req.json();
  if (!date || typeof(date) !== 'number') return NextResponse.json('Bad Request', { status: 400 });

  try {
    await db.insert(watched).values({
      username: user.username,
      imdbId,
      date,
    });

    cache.delete(`${user.username},${imdbId},watched`);
    cache.delete(`${user.username},watched`);

    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
