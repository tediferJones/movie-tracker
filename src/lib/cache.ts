import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { listnames, reviews, watched } from '@/drizzle/schema';
import { Methods } from '@/lib/easyFetch';
import { serverHashCacheV5 } from '@/lib/hashCacheV5';
import { ExistingMediaInfo } from '@/types';
import { getManyExistingMediaV2 } from '@/lib/getManyExistingMedia';

class Cache {
  cache: Record<string, { data: any, date: number }>

  constructor(maxTime: number) {
    this.cache = {}
    setInterval(() => {
      const currentTime = Date.now();
      Object.keys(this.cache).forEach(key => {
        const timeDiff = currentTime - this.cache[key].date;
        if (timeDiff > maxTime) delete this.cache[key];
      });
    }, maxTime);
  }

  get(key: string) {
    if (this.cache[key]) {
      this.cache[key].date = Date.now();
      return this.cache[key].data;
    }
  }

  set(key: string, data: any) {
    return this.cache[key] = { data, date: Date.now() };
  }

  delete(key: string) {
    return delete this.cache[key];
  }

  keys() {
    return Object.keys(this.cache);
  }
}

const maxTime = 1000 * 60 * 15; // 15 minutes
// const maxTime = 1000 * 60; // For testing purposes
const cache = new Cache(maxTime);
if (!(globalThis as any).cache) {
  console.log('SETTING CACHE');
  (globalThis as any).cache = cache;
}
export default cache;

type MediaReview = typeof reviews.$inferSelect
type Listname = typeof listnames.$inferSelect
type ListItem = (ExistingMediaInfo & { dateAdded: number })
type WatchedRec = typeof watched.$inferSelect & { title: string }
type UserReview = typeof reviews.$inferSelect & { title: string }

const cacheDataSymbol = Symbol('isCacheData');
class CacheData<T> {
  data: T;
  date = Date.now();
  [cacheDataSymbol] = true;

  constructor(data: T) {
    this.data = data;
  }
}

// type CacheResource<T> = CacheData<T> | undefined
// type CacheType = {
//   media: {
//     [imdbId: string]: {
//       mediaInfo?: CacheResource<ExistingMediaInfo>,
//       reviews?: CacheResource<MediaReview[]>,
//     } | undefined
//   },
//   users: {
//     [username: string]: {
//       reviews?: CacheResource<UserReview[]>,
//       listnames?: CacheResource<Listname[]>,
//       listContents?: CacheResource<ListItem[]>,
//       watched?: CacheResource<WatchedRec[]>,
//     } | undefined
//   }
// }
type CacheType = {
  media: {
    [imdbId: string]: {
      mediaInfo: CacheData<ExistingMediaInfo>,
      reviews: CacheData<MediaReview[]>,
    }
  },
  users: {
    [username: string]: {
      reviews: CacheData<UserReview[]>,
      listnames: CacheData<Listname[]>,
      listContents: CacheData<ListItem[]>,
      watched: CacheData<WatchedRec[]>,
    }
  }
}
type UnwrapCacheData<T> = T extends CacheData<infer U> ? U : never;

class CacheV2 {
  cache: CacheType;
  constructor() {
    this.cache = { media: {}, users: {} };
    setInterval(() => this.autoDelete(Date.now()), maxTime);
  }

  // this is only used for GET methods
  // All other methods will just clear the old keys
  async getSet<
    T extends keyof CacheType,
    K extends keyof CacheType[T],
    R extends keyof CacheType[T][K],
    V extends CacheType[T][K][R] & CacheData<unknown>
  >(type: T, key: K, resource: R, dbQuery: (() => Promise<V['data']>) | (() => V['data'])) {
    if (!this.get(type, key, resource)) {
      this.set(type, key, resource, await dbQuery());
    }
    return this.get(type, key, resource)!;
  }

  get<
    T extends keyof CacheType,
    K extends keyof CacheType[T],
    R extends keyof CacheType[T][K],
  >(type: T, key: K, resource: R): UnwrapCacheData<CacheType[T][K][R]> | undefined {
    return (this.cache[type]?.[key]?.[resource] as any)?.data;
  }

  set<
    T extends keyof CacheType,
    K extends keyof CacheType[T],
    R extends keyof CacheType[T][K],
    V extends CacheType[T][K][R] & CacheData<unknown>
  >(type: T, key: K, resource: R, value: V['data']) {
    if (!this.cache[type][key]) this.cache[type][key] = {} as any;
    this.cache[type][key][resource] = new CacheData(value) as any;
  }

  delete<
    T extends keyof CacheType,
    K extends keyof CacheType[T],
    R extends keyof CacheType[T][K],
  >(type: T, key: K, resource: R) {
    delete this.cache[type][key]?.[resource];
  }

  autoDelete(time: number, cache = this.cache as any) {
    Object.keys(cache).forEach(key => {
      if (cacheDataSymbol in cache[key]) {
        const timeDiff = time - cache[key].date;
        if (timeDiff > maxTime) delete cache[key];
      } else {
        this.autoDelete(time, cache[key]);
      }
    });
  }
}

type ParamTypes = 'string' | 'number' | 'boolean'
const paramConverters: { [key in ParamTypes]: (arg: string) => any } = {
  string: (arg) => String(arg),
  number: (arg) => Number(arg),
  boolean: (arg) => arg === 'true'
}

export async function apiHandler<
  T extends keyof CacheType,
  K extends keyof CacheType[T],
  R extends keyof CacheType[T][K],
  V extends CacheType[T][K][R] & CacheData<unknown>
>(
  req: Request,
  type: T,
  key: K,
  resource: R,
  dbQuery: (...args: any[]) => Promise<any>,
  opts: {
    needsAuth?: boolean,
    requiredParams?: { [param: string]: ParamTypes }, 
  } = {},
) {
  // types for data and resource should be tied to those of serverHashCache
  // if type === 'users' then key is username

  const method = req.method as Methods;
  const { searchParams } = new URL(req.url);
  const requiredParams = (
    Object.keys(opts.requiredParams || {}).map(param => {
      const type = opts.requiredParams![param];
      const paramVal = searchParams.get(param);
      if (!paramVal) throw Error(`Could not find param: ${param}`);
      return paramConverters[type](paramVal);
    })
  );

  if (opts.needsAuth) {
    // trying to modify user data, make sure user is self
    const user = await currentUser();
    if (!user?.username || user.username !== key) {
      return NextResponse.json('Unauthorized', { status: 401 });
    }
  }

  let data: V['data'];
  // if (method === 'GET') {
  //   data = await cacheV2.getSet(type, key, resource, dbQuery);
  // } else {
  //   cacheV2.delete(type, key, resource);
  //   data = await dbQuery();
  // }
  try {
    if (method === 'GET') {
      data = await cacheV2.getSet(type, key, resource, dbQuery);
    } else {
      cacheV2.delete(type, key, resource);
      data = await dbQuery(...requiredParams);
    }
  } catch (error) {
    console.log('ERROR', error)
    return NextResponse.json(
      'Failed to process request, database error',
      { status: 500 }
    );
  }

  if (type === 'users') {
    await serverHashCacheV5.update(
      req,
      key as string, // if type is 'users' then key is username
      data as any,
      method,
      resource as any
    );
  }

  return NextResponse.json(data);
}

export async function addTitleV2<T extends { imdbId: string }>(
  arr: T[]
): Promise<(T & { title: string })[]> {
  await getManyExistingMediaV2(arr.map(item => item.imdbId));
  return arr.map(item => {
    const mediaInfo = cacheV2.get('media', item.imdbId, 'mediaInfo');
    if (!mediaInfo) throw Error('could not find media info');
    return {
      ...item,
      title: mediaInfo.title,
    }
  });
}

declare global {
  var cacheV2Global: CacheV2 | undefined;
}
export const cacheV2 = (
  globalThis.cacheV2Global || new CacheV2()
);
if (!globalThis.cacheV2Global) {
  console.log('SETTING CACHEV2')
  globalThis.cacheV2Global = cacheV2;
}

// TESTING
// import { db } from '@/drizzle/db';
// const cacheV2 = new CacheV2();
// const test = cacheV2.cache['users']['username']['listContents'].data
// const testV2 = cacheV2.getSet('users', 'username', 'listnames', () => {
//   return db.select().from(listnames)
// })
// const testTitle = cacheV2.get('media', 'imdbId', 'mediaInfo').data.title
// cacheV2.set('users', 'me', 'watched', () => ('test' as any));
// const result = cacheV2.get('users', 'me', 'watched');
// console.log('GET', result);
