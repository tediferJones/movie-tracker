import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { and, desc, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { isValid } from '@/lib/inputValidation';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import cache from '@/lib/cache';
import { hashTable } from '@/lib/hashCache';
import { ReviewBody } from '@/components/pages/mediaPage/reviewManager';

type Params = { username: string }

// type Review = typeof reviews.$inferInsert
// type ReviewBody = Omit<Omit<Omit<Review, 'username'>, 'imdbId'>, 'date'>

export async function GET(req: Request, { params }: { params: Params }) {
  // if req has imdbId param, return single review for given imdbId
  // otherwise return all reviews for user
  const { username } = params;
  const { searchParams } = new URL(req.url);

  // TESTING
  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    const allReviews = await db.select().from(reviews).where(
      eq(reviews.username, username)
    ).orderBy(desc(reviews.date));

    await getManyExistingMedia(allReviews.map(review => review.imdbId));

    const result = allReviews.map((review: typeof allReviews[number] & { title?: string }) => {
      review.title = cache.get(review.imdbId).title;
      if (!review.title) throw Error('could not find title');
      return review;
    });

    hashTable.setResource(username, 'reviews', result);
    return NextResponse.json(result);
  }

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
        ).orderBy(desc(reviews.date));

        await getManyExistingMedia(allReviews.map(review => review.imdbId));

        cache.set(cacheStr, allReviews.map((review: typeof allReviews[number] & { title?: string }) => {
          review.title = cache.get(review.imdbId).title;
          if (!review.title) throw Error('could not find title');
          return review;
        }));
      }
      // WORKING
      return NextResponse.json(cache.get(cacheStr));

      // TESTING
      // const page = Number(searchParams.get('page'));
      // const pageSize = Number(searchParams.get('pageSize'));
      // const results = cache.get(cacheStr)
      // if (!page || !pageSize) return NextResponse.json(results)
      // const start = (page - 1) * pageSize;
      // const end = (page * pageSize)
      // console.log({ start, end })
      // return NextResponse.json([
      //   ...results.slice(start, end),
      //   results.length
      // ])
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

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    // FIX ME
    // probably dont even have to do this, database should error out based on compound key
    // cannot have two records with same username and imdbId
    // or if review exists, just forward to PUT method
    const exisitingReview = await db.select().from(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    ).get();

    if (exisitingReview) {
      return NextResponse.json('Review already exists', { status: 400 });
    }

    const newRecord = {
      username,
      imdbId,
      date: Date.now(),
      ...review,
    }
    await db.insert(reviews).values(newRecord);
    // hashTable.setResource(username, 'reviews', result);
    if (!cache.get(imdbId)) await getManyExistingMedia([ imdbId ]);
    const title = cache.get(imdbId).title;
    const newNewRecord = { ...newRecord, title }
    hashTable.updateResource(username, 'reviews', 'POST', newNewRecord);
    cache.delete(`${imdbId},reviews`);
    return NextResponse.json(newNewRecord);
  }

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

    await db.insert(reviews).values({
      username,
      imdbId,
      date: Date.now(),
      ...review
    });
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

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    // probably dont need to do this either
    // if there is no record with matching username and imdbId, nothing will be updated
    const existingReview = await db.select().from(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    ).get();
    if (!existingReview) {
      return NextResponse.json('No review to update', { status: 400 });
    }

    const updatedReview = {
      ...review,
      date: Date.now()
    }
    await db.update(reviews).set(updatedReview).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    );
    if (!cache.get(imdbId)) await getManyExistingMedia([ imdbId ]);
    const title = cache.get(imdbId).title;
    const newNewRecord = { ...updatedReview, username, imdbId, title }
    hashTable.updateResource(username, 'reviews', 'PUT', newNewRecord);
    cache.delete(`${imdbId},reviews`);
    return NextResponse.json(newNewRecord);
  }

  try {
    const existingReview = await db.select().from(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    ).get();
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

  if (searchParams.has('testType') && searchParams.get('testType') === 'userContext') {
    await db.delete(reviews).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    );
    hashTable.updateResource(username, 'reviews', 'DELETE', { imdbId });
    cache.delete(`${imdbId},reviews`);
    return NextResponse.json({ imdbId });
  }

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
