import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { isValid } from '@/lib/inputValidation';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import cache from '@/lib/cache';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';

type Params = { username: string }
type Review = typeof reviews.$inferInsert
type ReviewBody = Omit<Omit<Review, 'username'>, 'imdbId'>

export async function GET(req: Request, { params }: { params: Params }) {
  // if req has imdbId param, return single review for given imdbId
  // otherwise return all reviews for user
  const { username } = params;
  const { searchParams } = new URL(req.url);

  try {
    if (searchParams.has('imdbId')) {
      const imdbId = searchParams.get('imdbId')!;
      const cacheStr = `${username},${imdbId},review`;
      if (!cache.get(cacheStr)) {
        const review = await db.select().from(reviews).where(
          and(
            eq(reviews.username, username),
            eq(reviews.imdbId, imdbId),
          )
        ).get();
        cache.set(cacheStr, review);
      }
      return NextResponse.json(cache.get(cacheStr) || null);
    } else {
      const cacheStr = `${username},reviews`;
      if (!cache.get(cacheStr)) {
        const allReviews = await db.select().from(reviews).where(
          eq(reviews.username, username)
        );

        await getManyExistingMedia(allReviews.map(review => review.imdbId));

        cache.set(cacheStr, allReviews.map((review: typeof allReviews[number] & { title?: string }) => {
          review.title = cache.get(review.imdbId).title;
          if (!review.title) throw Error('could not find title');
          return review;
        }));
      }
      return NextResponse.json(cache.get(cacheStr));
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  // Create new review, requires imdbId, and at least one review field
  const { username } = params;
  const { searchParams } = new URL(req.url);
  const review: ReviewBody  = await req.json();

  const valid = isValid(review)
  if (!valid) return NextResponse.json('Input is not valid', { status: 400 })
  review.watchAgain = review.watchAgain === null ? null : !!review.watchAgain

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!searchParams.has('imdbId')) {
    return NextResponse.json('Bad request', { status: 400 });
  }

  const imdbId = searchParams.get('imdbId')!;
  try {
    const exisitingReview = await db.select().from(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    ).get();
    if (exisitingReview) {
      return NextResponse.json('Review already exists', { status: 400 });
    }

    await db.insert(reviews).values({ username, imdbId, ...review });
    cache.delete(`${username},${imdbId},review`);
    cache.delete(`${username},reviews`);
    cache.delete(`${imdbId},reviews`);
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  // update existing review, requires imdbId
  const { username } = params;
  const { searchParams } = new URL(req.url);
  const review: ReviewBody  = await req.json();

  const valid = isValid(review)
  if (!valid) return NextResponse.json('Input is not valid', { status: 400 })
  review.watchAgain = review.watchAgain === null ? null : !!review.watchAgain

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!searchParams.has('imdbId')) {
    return NextResponse.json('Bad request', { status: 400 });
  }

  const imdbId = searchParams.get('imdbId')!;
  try {
    const existingReview = await db.select().from(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    )
    if (!existingReview) {
      return NextResponse.json('No review to update', { status: 400 });
    }

    await db.update(reviews).set(review).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    );
    cache.delete(`${username},${imdbId},review`);
    cache.delete(`${username},reviews`);
    cache.delete(`${imdbId},reviews`);
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // Delete existing review
  const { username } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  if (!searchParams.has('imdbId')) {
    return NextResponse.json('Bad request', { status: 400 });
  }

  const imdbId = searchParams.get('imdbId')!;
  try {
    await db.delete(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    );
    cache.delete(`${username},${imdbId},review`);
    cache.delete(`${username},reviews`);
    cache.delete(`${imdbId},reviews`);
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
