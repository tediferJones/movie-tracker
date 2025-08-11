import { db } from '@/drizzle/db';
import { watched } from '@/drizzle/schema';
import { cache } from '@/lib/dataCache/config';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

    // FIX ME, make sure this actually works
    cache.delete('users', user.username, 'watched');

    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
