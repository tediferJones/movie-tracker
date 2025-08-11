import { db } from '@/drizzle/db';
import { reviews } from '@/drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { useCache } from '@/lib/useCache';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  return await useCache(req, 'GET', 'media', imdbId, 'reviews',
    async () => {
      return await db.select().from(reviews).where(
        eq(reviews.imdbId, imdbId)
      ).orderBy(desc(reviews.date));
    }
  );
}
