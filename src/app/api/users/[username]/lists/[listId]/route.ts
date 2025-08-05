import { db } from '@/drizzle/db';
import { lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { cacheV2, useCache } from '@/lib/cache';
import { getManyExistingMediaV2 } from '@/lib/getManyExistingMedia';

type Params = { username: string, listId: number }

export async function GET(req: Request, { params }: { params: Params }) {
  // get full media data for every item in list
  const { username, listId } = params;

  return await useCache(req, 'GET', 'users', username, 'listContents',
    async () => {
      const listRecords = await db.select().from(lists).where(
        eq(lists.listnameId, listId),
      );
      await getManyExistingMediaV2(listRecords.map(rec => rec.imdbId));
      return listRecords.map(({ imdbId, date }) => {
        const mediaInfo = cacheV2.get('media', imdbId, 'mediaInfo');
        if (!mediaInfo) throw Error('could not find media info');
        return { ...mediaInfo, dateAdded: date };
      });
    }, {
      extraKeys: [ listId ]
    }
  );
}

export async function POST(req: Request, { params }: { params: Params }) {
  // add imdbId to list
  const { username, listId } = params;

  return await useCache(req, 'POST', 'users', username, 'listContents',
    async (listname: string, listId: number, imdbId: string) => {
      const date = Date.now();
      const newRecord = {
        username,
        listname,
        imdbId,
        date,
        listnameId: listId,
      }
      await db.insert(lists).values(newRecord);
      const [ mediaInfo ] = await getManyExistingMediaV2([ imdbId ]);
      return { ...mediaInfo, dateAdded: date };
    }, {
      needsAuth: true,
      extraKeys: [ listId ],
      params: {
        listname: { type: 'string', required: true, validator: 'listname' },
        listId: { type: 'number', required: true },
        imdbId: { type: 'string', required: true },
      },
    }
  );
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // Delete imdbId from list
  const { username, listId } = params;

  return await useCache(req, 'DELETE', 'users', username, 'listContents',
    async (imdbId: string) => {
      await db.delete(lists).where(
        and(
          eq(lists.username, username),
          eq(lists.listnameId, listId),
          eq(lists.imdbId, imdbId),
        )
      );
      return { imdbId };
    }, {
      needsAuth: true,
      extraKeys: [ listId ],
      params: { imdbId: { type: 'string', required: true } },
    }
  );
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  // bump list item to top of list
  const { username, listId } = params;

  return await useCache(req, 'PATCH', 'users', username, 'listContents',
    async (imdbId: string) => {
      const date = Date.now();
      await db.update(lists).set({ date }).where(
        and(
          eq(lists.username, username),
          eq(lists.listnameId, listId),
          eq(lists.imdbId, imdbId)
        )
      );
      const [ mediaInfo ] = await getManyExistingMediaV2([ imdbId ]);
      return { ...mediaInfo, dateAdded: date };
    }, {
      needsAuth: true,
      extraKeys: [ listId ],
      params: { imdbId: { type: 'string', required: true } },
    }
  );
}
