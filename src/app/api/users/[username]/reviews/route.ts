import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // if req has imdbId param, return single review for given imdbId
  // otherwise return all reviews for user
  const { username } = params;
  const imdbId = new URLSearchParams(req.url).get('imdbId')

  try {
    if (imdbId) {
      const review = await db.select().from(reviews).where(
        and(
          eq(reviews.username, username),
          eq(reviews.imdbId, imdbId),
        )
      ).get()
      return NextResponse.json(review)
    } else {
      const allReviews = await db.select().from(reviews).where(
        eq(reviews.username, username)
      )
      return NextResponse.json(allReviews)
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
