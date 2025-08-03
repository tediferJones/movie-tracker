import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { useCache } from '@/lib/cache';

type Params = { username: string }
type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export async function GET(req: Request, { params }: { params: Params }) {
  // return all listnames
  // if url has imdbId param, return listnames for lists that contain imdbId
  const { username } = params;

  return await useCache(req, 'GET', 'users', username, 'listnames', async () => {
    return await db.select().from(listnames).where(
      eq(listnames.username, username)
    );
  });
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { username } = params;

  return await useCache(req, 'POST', 'users', username, 'listnames', async (listname: string) => {
    const preInsertRecord = {
      username,
      listname,
      defaultList: false,
      date: Date.now(),
    }

    const { lastInsertRowid } = await db.insert(listnames).values(preInsertRecord);
    return {
      ...preInsertRecord,
      id: Number(lastInsertRowid),
    }
  }, {
      needsAuth: true,
      requiredParams: { listname: 'string' },
      validate: { listname: 'listname' },
    });
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { username } = params;

  return await useCache(req, 'PUT', 'users', username, 'listnames', async (
    listname: string,
    newListname: string
  ) => {
      await db.update(listnames).set({ listname: newListname }).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      );
      return await db.select().from(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, newListname),
        )
      ).get();
    }, {
      needsAuth: true,
      requiredParams: {
        listname: 'string',
        newListname: 'string',
      },
      validate: {
        listname: 'listname',
        newListname: 'listname',
      }
    }
  );
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { username } = params;

  return await useCache(req, 'DELETE', 'users', username, 'listnames', async (id: number) => {
    await db.delete(listnames).where(
      and(
        eq(listnames.username, username),
        eq(listnames.id, id),
      )
    );
    return { id };
  }, {
      needsAuth: true,
      requiredParams: { id: 'number' }
    });
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { username } = params;

  // this works but clientHashCache patch modFunc will need fixed
  // right now patch just finds a matching record and replaces it,
  // but when setting default list we need to update the current record (already being done)
  // BUT we also need to upate the old record
  // Would it be possible to just return two record? And run them both through patch?
  // then the old record and new record should both match what is in the db
  return await useCache(req, 'PATCH', 'users', username, 'listnames', async (
    listname: string,
    set: string,
    val: boolean
  ) => {
      const booleans = {
        defaultList: false
      } satisfies { [K in BooleanKeys<typeof listnames.$inferSelect>]: false }

      if (!(set in booleans)) {
        throw Error(`Invalid set param: ${set}`);
      }

      await db.update(listnames).set({ [set]: false, }).where(
        eq(listnames.username, username)
      );

      await db.update(listnames).set({ [set]: val }).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      );

      return await db.select().from(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      ).get();
    }, {
      requiredParams: {
        listname: 'string',
        set: 'string',
        val: 'boolean',
      },
      validate: { listname: 'listname' }
    }
  );
}
