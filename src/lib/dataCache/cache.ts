import {
  DbArgs,
  ExtraKeys,
  ParamConfig
} from '@/lib/dataCache/types';
import { CacheData, cacheDataSymbol } from '@/lib/dataCache/cacheData';
import { CacheType } from '@/lib/dataCache/config';

type UnwrapCacheData<T> = T extends CacheData<infer U> ? U : never

const maxTime = 1000 * 60 * 15; // 15 minutes
// const maxTime = 1000 * 60; // For testing purposes

// FIX ME, clean up comments
export default class Cache {
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
