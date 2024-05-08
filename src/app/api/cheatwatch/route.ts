import { db } from '@/drizzle/db';
import { media, watched } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, date } = await req.json();
  if (!date || typeof(date) !== 'number') return NextResponse.json('Bad Request', { status: 400 })

  const imdbIdExists = await db.select().from(media).where(eq(media.imdbId, imdbId)).get()
  if (!imdbIdExists) return NextResponse.json('Bad Request', { status: 400 })

  await db.insert(watched).values({
    username: user.username,
    imdbId,
    date,
  })

  return new NextResponse;
}
