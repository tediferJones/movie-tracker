import { db } from '@/drizzle/db';
import { listnames, media, reviews, watched } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

async function getTitle(imdbId: string) {
  return (await db.select({ title: media.title }).from(media).where(eq(media.imdbId, imdbId)).get())?.title
}

export async function GET(req: Request) {
  const username = new URL(req.url).searchParams.get('username')
  if (!username) return NextResponse.json('Bad request', { status: 400 })
  return NextResponse.json({
    listnames: (
      (await db.select().from(listnames).where(eq(listnames.username, username)))
        .map(rec => rec.listname)
    ),
    watched: (
      await Promise.all(
        (await db.select().from(watched).where(eq(watched.username, username)))
          .map(async rec => ({
            date: rec.date,
            imdbId: rec.imdbId,
            title: await getTitle(rec.imdbId),
          }))
      )
    ).sort((a, b) => a.date - b.date),
    reviews: (
      await Promise.all(
        (await db.select().from(reviews).where(eq(reviews.username, username)))
          .map(async rec => ({ ...rec, title: await getTitle(rec.imdbId) }))
      )
    )
  })
}
