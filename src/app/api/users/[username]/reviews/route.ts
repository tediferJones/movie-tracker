import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { addTitleV2, useCache } from '@/lib/cache';
import { ReviewBody } from '@/components/pages/mediaPage/reviewManager';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // return all reviews for user
  const { username } = params;
  
  return await useCache(req, 'GET', 'users', username, 'reviews',
    async () => {
      const allReviews = await db.select().from(reviews).where(
        eq(reviews.username, username)
      );
      return await addTitleV2(allReviews);
    }
  );
}

export async function POST(req: Request, { params }: { params: Params }) {
  // Create new review, requires imdbId, and at least one review field
  const { username } = params;

  return await useCache(req, 'POST', 'users', username, 'reviews',
    async ({ body, params }) => {
      const { imdbId } = params;
      const review: ReviewBody = body;

      const newRecord = {
        username,
        imdbId,
        date: Date.now(),
        ...review,
      }
      await db.insert(reviews).values(newRecord);
      const [ reviewWithTitle ] = await addTitleV2([ newRecord ]);
      return reviewWithTitle;
    }, {
      needsAuth: true,
      params: { imdbId: { type: 'string', required: true } },
      body: { type: 'json', validate: true },
    }
  );
}

export async function PUT(req: Request, { params }: { params: Params }) {
  // update existing review, requires imdbId
  const { username } = params;

  return await useCache(req, 'PUT', 'users', username, 'reviews',
    async ({ body, params }) => {
      const { imdbId } = params;
      const review: ReviewBody = body;
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

      const fullReview = { ...updatedReview, username, imdbId };
      const [ reviewWithTitle ] = await addTitleV2([ fullReview ]);
      return reviewWithTitle;
    }, {
      needsAuth: true,
      params: { imdbId: { type: 'string', required: true } },
      body: { type: 'json', validate: true },
    }
  );
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // Delete existing review
  const { username } = params;

  return await useCache(req, 'DELETE', 'users', username, 'reviews',
    async ({ params }) => {
      const { imdbId } = params;
      await db.delete(reviews).where(
        and(
          eq(reviews.username, username),
          eq(reviews.imdbId, imdbId),
        )
      );
      return { imdbId };
    }, {
      needsAuth: true,
      params: { imdbId: { type: 'string', required: true } }
    }
  );
}
