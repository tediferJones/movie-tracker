import { db } from '@/drizzle/db';
import { watched } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { addTitleV2, useCache } from '@/lib/cache';
import { getManyExistingMediaV2 } from '@/lib/getManyExistingMedia';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  // get all watched records for a given user
  const { username } = params;

  return await useCache(req, 'GET', 'users', username, 'watched',
    async () => {
      const watchRecs = await db.select().from(watched).where(
        eq(watched.username, username)
      );
      return await addTitleV2(watchRecs);
    }
  );
}

export async function POST(req: Request, { params }: { params: Params }) {
  // add watched record for user and imdbId
  const { username } = params;

  return await useCache(req, 'POST', 'users', username, 'watched',
    async ({ params }) => {
      const { imdbId } = params;
      const preInsertRecord = { username, imdbId, date: Date.now() };
      const { lastInsertRowid } = await db.insert(watched).values(preInsertRecord);
      const [ mediaInfo ] = await getManyExistingMediaV2([ imdbId ]);
      const postInsertRecord = {
        id: Number(lastInsertRowid),
        title: mediaInfo.title,
        ...preInsertRecord,
      }
      return postInsertRecord;
    }, {
      needsAuth: true,
      params: { imdbId: { type: 'string', required: true } },
    }
  );
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // delete watch record for a given user and id
  const { username } = params;

  return await useCache(req, 'DELETE', 'users', username, 'watched',
    async ({ params }) => {
      const { id } = params;
      await db.delete(watched).where(
        and(
          eq(watched.username, username),
          eq(watched.id, id),
        )
      );
      return { id };
    }, {
      needsAuth: true,
      params: { id: { type: 'number', required: true } },
    }
  );
}
