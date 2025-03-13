import { db } from '@/drizzle/db';
import { lists, media } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string, listname: string, imdbId: string }

export async function POST(req: Request, { params }: { params: Params }) {
  const { username, listname, imdbId } = params

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  try {
    const imdbIdExists = await db.select().from(media).where(
      eq(media.imdbId, imdbId)
    ).get()
    if (!imdbIdExists) {
      return NextResponse.json('ImdbId does not exist in media table', { status: 400 })
    }

    const alreadyInList = await db.select().from(lists).where(
      and(
        eq(lists.username, username),
        eq(lists.listname, listname),
        eq(lists.imdbId, imdbId),
      )
    ).get()
    if (alreadyInList) {
      return new NextResponse()
    }

    await db.insert(lists).values({ username, listname, imdbId })
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 })
  }

  return new NextResponse()
}

export async function PUT() {
  // bump list item here, but lets wait to implement this until we add date column to lists table
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { username, listname, imdbId } = params

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  try {
    await db.delete(lists).where(
      and(
        eq(lists.username, username),
        eq(lists.listname, listname),
        eq(lists.imdbId, imdbId),
      )
    )
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 })
  }

  return new NextResponse()
}
