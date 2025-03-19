import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { isValid } from '@/lib/inputValidation';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
      console.log('imdbId is', imdbId)
      const review = await db.select().from(reviews).where(
        and(
          eq(reviews.username, username),
          eq(reviews.imdbId, imdbId),
        )
      ).get();
      return NextResponse.json(review || null);
    } else {
      const allReviews = await db.select().from(reviews).where(
        eq(reviews.username, username)
      );
      return NextResponse.json(allReviews);
    }
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
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
    await db.insert(reviews).values({ username, imdbId, ...review });
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
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
    await db.update(reviews).set(review).where(
      and(
        eq(reviews.username, username),
        eq(reviews.imdbId, imdbId),
      )
    );
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
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
    return new NextResponse();
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
