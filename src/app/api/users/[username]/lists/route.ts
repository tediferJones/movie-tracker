import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import { useCache } from '@/lib/useCache';
import { and, eq } from 'drizzle-orm';

type Params = { username: string }
type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export async function GET(req: Request, { params }: { params: Params }) {
  // return all listname objects associated with username
  const { username } = params;

  return await useCache(req, 'GET', 'users', username, 'listnames',
    async () => {
      return await db.select().from(listnames).where(
        eq(listnames.username, username)
      );
    }
  );
}

export async function POST(req: Request, { params }: { params: Params }) {
  // create new listname
  const { username } = params;

  return await useCache(req, 'POST', 'users', username, 'listnames',
    async ({ params }) => {
      const { listname } = params;
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
      params: {
        listname: { type: 'string', required: true, validator: 'listname' },
      }
    }
  );
}

export async function PUT(req: Request, { params }: { params: Params }) {
  // rename listname
  const { username } = params;

  return await useCache(req, 'PUT', 'users', username, 'listnames',
    async ({ params }) => {
      const { listname, newListname } = params;
      await db.update(listnames).set({ listname: newListname }).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      );
      const record = await db.select().from(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, newListname),
        )
      ).get();
      if (!record) throw Error('no record to update');
      return record;
    }, {
      needsAuth: true,
      params: {
        listname: { type: 'string', required: true, validator: 'listname' },
        newListname: { type: 'string', required: true, validator: 'listname' },
      }
    }
  );
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  // delete listname (and it's content)
  const { username } = params;

  return await useCache(req, 'DELETE', 'users', username, 'listnames',
    async ({ params }) => {
      const { id } = params;
      await db.delete(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.id, id),
        )
      );
      return { id };
    }, {
      needsAuth: true,
      params: { id: { type: 'number', required: true } },
    }
  );
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  // update listType (i.e. change defaultList)
  const { username } = params;

  // this works but clientHashCache patch modFunc will need fixed
  // right now patch just finds a matching record and replaces it,
  // but when setting default list we need to update the current record (already being done)
  // BUT we also need to upate the old record
  // Would it be possible to just return two record? And run them both through patch?
  // then the old record and new record should both match what is in the db
  //
  // Easiest fix: Do not allow users to auto switch listTypes
  // i.e. users must manually uncheck defaultList and then check the new defaultList
  // users CANNOT check a diffent default list and have it un-defaultList the first
  // and set second as defaultList
  return await useCache(req, 'PATCH', 'users', username, 'listnames',
    async ({ params }) => {
      const { listname, set, val } = params;
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

      const record = await db.select().from(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, listname),
        )
      ).get();
      if (!record) throw Error('no record to patch');
      return record;
    }, {
      params: {
        listname: { type: 'string', required: true, validator: 'listname' },
        set: { type: 'string', required: true },
        val: { type: 'boolean', required: true },
      }
    }
  );
}
