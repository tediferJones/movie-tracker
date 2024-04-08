import { db } from '@/drizzle/db';
import { people } from '@/drizzle/schema';
import getExistingMedia from '@/lib/getExistingMedia';
import { and, count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

async function getPosition(position: string, name: string) {
  return await Promise.all(
    (await db.select({ imdbId: people.imdbId }).from(people).where(
      and(
        eq(people.name, name),
        eq(people.position, position)
      )
    )).map(rec => getExistingMedia(rec.imdbId))
  )
}

export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get('name');
  
  if (name) {
    return NextResponse.json(
      {
        actor: await getPosition('actor', name),
        director: await getPosition('director', name),
        writer: await getPosition('writer', name),
      }
    )
  }

  return NextResponse.json(
    (await db.selectDistinct({ name: people.name, count: count(people.name) }).from(people).groupBy(people.name))
      .sort((a, b) => a.name.localeCompare(b.name))
  )
}
