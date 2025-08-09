import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { listnames, reviews, watched } from '@/drizzle/schema';
import { getManyExistingMediaV2 } from '@/lib/getManyExistingMedia';
import { isValid } from '@/lib/inputValidation';
import { Methods } from '@/lib/easyFetch';
import { ServerTypes } from '@/lib/hashCache/config';
import { FillWith } from '@/lib/hashCache/types';
import { serverHashCacheV5 } from '@/lib/hashCacheV5';
import { ExistingMediaInfo } from '@/types';

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
type ListItem = ExistingMediaInfo & { dateAdded: number }
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

type ResTypes = {
  media: {
    mediaInfo: FillWith<{
      GET: ExistingMediaInfo,
    }, void>,
    reviews: FillWith<{
      GET: MediaReview[],
    }, void>,
  },
  users: ServerTypes,
}

type GetResType<
  T extends keyof ResTypes,
  R extends keyof ResTypes[T],
  M extends keyof ResTypes[T][R],
> = ResTypes[T][R][M]

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
      listContents: { [key: (string | number)] : CacheData<ListItem[]> },
      watched: CacheData<WatchedRec[]>,
    }
  }
}

type UnwrapCacheData<T> = T extends CacheData<infer U> ? U : never
type ExtraKeys = (string | number)[]
// type DbArgs = { body?: any, params?: Record<string, any> }
type DbArgs<P extends Record<string, ParamConfig> = {}> = {
  body?: any,
  params?: InferredParams<P>,
}

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
    V extends CacheType[T][K][R] & CacheData<unknown>,
    P extends Record<string, ParamConfig> = {},
  >(
    type: T,
    key: K,
    resource: R,
    dbQuery: ((args: Required<DbArgs<P>>) => Promise<V['data']> | V['data']),
    dbArgs: Required<DbArgs<P>>,
    ...extraKeys: ExtraKeys
  ) {
    if (!this.get(type, key, resource, ...extraKeys)) {
      this.set(type, key, resource, await dbQuery(dbArgs), ...extraKeys);
    }
    return this.get(type, key, resource, ...extraKeys)!;
  }

  get<
    T extends keyof CacheType,
    K extends keyof CacheType[T],
    R extends keyof CacheType[T][K],
  >(
    type: T,
    key: K,
    resource: R,
    ...extraKeys: ExtraKeys
  ): UnwrapCacheData<CacheType[T][K][R]> | undefined {
    // return (this.cache[type]?.[key]?.[resource] as any)?.data;
    const result = (this.cache[type]?.[key]?.[resource] as any);
    // console.log('initial', result)
    return extraKeys.reduce((obj, key) => {
      // console.log('CRAWLING', obj, key)
      if (obj === undefined) return undefined;
      return obj[key];
    }, result)?.data;
  }

  set<
    T extends keyof CacheType,
    K extends keyof CacheType[T],
    R extends keyof CacheType[T][K],
    V extends CacheType[T][K][R] & CacheData<unknown>
  >(type: T, key: K, resource: R, value: V['data'], ...extraKeys: ExtraKeys) {
    // if (!this.cache[type][key]) this.cache[type][key] = {} as any;
    // this.cache[type][key][resource] = new CacheData(value) as any;

    [ type, key, resource, ...extraKeys ].reduce((obj, key, i, arr) => {
      if (i === arr.length - 1) {
        obj[key] = new CacheData(value);
      } else if (!obj[key]) {
        obj[key] = {};
      }
      return obj[key];
    }, this.cache as any);
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

type ParamTypes = keyof TypeMap
type TypeMap = {
  string: string,
  number: number,
  boolean: boolean,
}
const paramConverters: { [K in ParamTypes]: (arg: string) => TypeMap[K] } = {
  string: (arg) => String(arg),
  number: (arg) => Number(arg),
  boolean: (arg) => arg === 'true',
}

const bodyConverters = {
  json: async (req: Request) => await req.json(),
}

type ParamConfig = {
  type: ParamTypes,
  validator?: string,
  required?: boolean,
}

type InferredParams<T extends Record<string, ParamConfig>> = {
  [K in keyof T]: T[K]['required'] extends true ? TypeMap[T[K]['type']]
    : TypeMap[T[K]['type']] | undefined
}

// Move this to its own lib file
export async function useCache<
  M extends Methods & keyof ResTypes[T][R],
  T extends keyof CacheType,
  K extends keyof CacheType[T],
  R extends keyof CacheType[T][K] & keyof ResTypes[T],
  V extends CacheType[T][K][R] & CacheData<unknown>,
  P extends { [param: string]: ParamConfig } = {},
>(
  req: Request,
  method: M,
  type: T,
  key: K,
  resource: R,
  // dbQuery: (args: Required<DbArgs<P>>) => Promise<any>,
  dbQuery: (args: Required<DbArgs<P>>) => Promise<GetResType<T, R, M>>,
  opts: {
    needsAuth?: boolean,
    extraKeys?: ExtraKeys,
    params?: P,
    body?: {
      type: keyof typeof bodyConverters,
      validate?: boolean,
    }
  } = {},
) {
  // types for data and resource should be tied to those of serverHashCache
  // if type === 'users' then key is username

  const user = await currentUser();
  const isSelf = user?.username && user.username === key;
  if (opts.needsAuth && !isSelf) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const useHashCache = searchParams.get('useHashCache') === 'true';
  const extraKeys = opts.extraKeys || [];

  // should probably wrap this in try catch,
  // throw error with reason for failure and status code,
  // return error as NextResponse
  const params = Object.keys(opts.params || {}).reduce((params, param) => {
    const paramObj = opts.params![param];
    const paramStr = searchParams.get(param);
    if (!paramStr) {
      if (paramObj.required) {
        throw Error(`Param ${param} is required`);
      } else {
        // param does not exist but isn't required, so just do nothing
        return params;
      }
    }
    // param exists
    const paramVal = paramConverters[paramObj.type](paramStr);

    // validate
    if (paramObj.validator && !isValid({ [paramObj.validator]: paramVal })) {
      throw Error(`Param ${param} is not valid`);
    }

    params[param] = paramVal;
    return params;
  }, {} as { [param: string]: any }) as InferredParams<P>;
  console.log('ParamsResult', params);

  let parsedBody;
  if (opts.body) {
    const result = await bodyConverters[opts.body.type](req);
    if (opts.body.validate && !isValid(result)) {
      throw Error('body invalid');
    }
    parsedBody = result;
  }

  const dbArgs: Required<DbArgs<P>> = {
    body: parsedBody || undefined,
    params,
  }

  let data: V['data'];
  try {
    if (method === 'GET') {
      data = await cacheV2.getSet(
        type,
        key,
        resource,
        dbQuery as any,
        dbArgs,
        ...extraKeys,
      );
    } else {
      cacheV2.delete(type, key, resource);
      data = await dbQuery(dbArgs);
    }
  } catch (error) {
    console.log('ERROR', error)
    return NextResponse.json(
      'Failed to process request, database error',
      { status: 500 }
    );
  }

  if (isSelf && useHashCache) {
    await serverHashCacheV5.update(
      req,
      key as string, // if type is 'users' then key is username
      data as any,
      method,
      resource as any,
      ...extraKeys,
    );
  }

  return NextResponse.json(data || 'Operation Successful');
}

// Move this to its own lib file
export async function addTitleV2<T extends { imdbId: string }>(
  arr: T[]
): Promise<(T & { title: string })[]> {
  await getManyExistingMediaV2(arr.map(item => item.imdbId));
  return arr.map(item => {
    const mediaInfo = cacheV2.get('media', item.imdbId, 'mediaInfo');
    if (!mediaInfo) throw Error('could not find media info');
    return { ...item, title: mediaInfo.title };
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

// const testCache = new CacheV2();
// testCache.set('users', 'username', 'listContents', [ 'yes' ] as any, '1')
// const result = testCache.get('users', 'username', 'listContents', '1')
// console.log('GET RESULT', result)
// console.log(testCache.cache.users.username)

// ROUTE THAT CAN PROBABLY BE DELETED
// /api/users/[username]/defaultList (deprecated by PATCH /api/users/[username]/lists/[listId])
