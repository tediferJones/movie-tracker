import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const imdbId = new URL(req.url).searchParams.get('imdbId')
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  return NextResponse.json(
    await db.select().from(reviews).where(and(
      eq(reviews.username, user.username),
      eq(reviews.imdbId, imdbId),
    ))
  )
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, review, rating, watchAgain } = await req.json();
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  await db.insert(reviews).values({
    username: user.username,
    imdbId,
    review,
    rating,
    watchAgain,
  })

  return new NextResponse;
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId, review, rating, watchAgain } = await req.json();
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  await db.update(reviews).set({ review, rating, watchAgain }).where(
    and(
      eq(reviews.username, user.username),
      eq(reviews.imdbId, imdbId),
    )
  )

  return new NextResponse;
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { imdbId } = await req.json();
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  await db.delete(reviews).where(
    and(
      eq(reviews.username, user.username),
      eq(reviews.imdbId, imdbId)
    )
  )

  return new NextResponse;
}
