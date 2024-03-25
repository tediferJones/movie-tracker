import { NextResponse  } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { watched } from '@/drizzle/schema';
import { db } from '@/drizzle/db';
import { and, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const imdbId = new URL(req.url).searchParams.get('imdbId')
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  return NextResponse.json(
    await db.select().from(watched).where(eq(watched.imdbId, imdbId))
  );
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId } = await req.json();

  await db.insert(watched).values({
    imdbId,
    username: user.username,
    date: new Date().getTime(),
  })

  return new NextResponse;
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { id } = await req.json();

  await db.delete(watched).where(
    and(
      eq(watched.id, id),
      eq(watched.username, user.username),
    )
  )

  return new NextResponse;
}
