import { db } from '@/drizzle/db';
import { listnames, media, reviews, watched } from '@/drizzle/schema';
import { clerkClient } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

async function getTitle(imdbId: string) {
  return (await db.select({ title: media.title }).from(media).where(eq(media.imdbId, imdbId)).get())?.title
}

export async function GET(req: Request) {
  const username = new URL(req.url).searchParams.get('username')

  if (!username) {
    // simplified version
    const allUsernames = (await clerkClient.users.getUserList()).map(user => user.username)
    console.log('getting usernames', allUsernames.sort())

    // This is pretty egregious, but it works
    // We should probably create a users table with a single unique column called username
    // This table should then be referenced as a foreign key in tables like watched, lists, and reviews
    return NextResponse.json(
      [
        await db.selectDistinct({ username: listnames.username }).from(listnames),
        await db.selectDistinct({ username: reviews.username }).from(reviews),
        await db.selectDistinct({ username: watched.username }).from(watched),
      ]
        .flat()
        .map(rec => rec.username)
        .reduce((newSet, username) => {
          return newSet.includes(username) ? newSet : newSet.concat(username)
        }, [] as string[])
        .map(username => ({ username }))
    )
  }

  return NextResponse.json({
    listnames: (
      (await db.select().from(listnames).where(eq(listnames.username, username)))
        .map(rec => rec.listname)
    ).sort(),
    watched: (
      await Promise.all(
        (await db.select().from(watched).where(eq(watched.username, username)))
          .map(async rec => ({
            date: rec.date,
            imdbId: rec.imdbId,
            title: await getTitle(rec.imdbId),
          }))
      )
    ).sort((a, b) => b.date - a.date),
    reviews: (
      await Promise.all(
        (await db.select().from(reviews).where(eq(reviews.username, username)))
          .map(async rec => ({ ...rec, title: await getTitle(rec.imdbId) }))
      )
    ),
    defaultList: (await db.select().from(listnames).where(
      and(
        eq(listnames.username, username),
        eq(listnames.defaultList, true)
      )
    ).get())?.listname
  })
}
