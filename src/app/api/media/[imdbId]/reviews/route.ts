import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  return NextResponse.json(
    await db.select().from(reviews).where(eq(reviews.imdbId, imdbId))
  )
}
