import { listnames, reviews, watched } from '@/drizzle/schema';
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
type ListItem = (ExistingMediaInfo & { dateAdded: number })
type WatchedRec = typeof watched.$inferSelect & { title: string }
type UserReview = typeof reviews.$inferSelect & { title: string }
class CacheV2 {
  cache: {
    media: {
      [imdbId: string]: {
        mediaInfo: ExistingMediaInfo,
        reviews: MediaReview[],
      }
    },
    users: {
      [username: string]: {
        reviews: UserReview[],
        lists: Listname[],
        listContents: ListItem[],
        watched: WatchedRec[],
      }
    }
  }

  constructor() {
    this.cache = {
      media: {},
      users: {},
    }
  }

  getKeys(req: Request) {
    const keys = (
      new URL(req.url).pathname.split('/')
      .filter(segment => segment && segment !== 'api')
    );
    const rest = keys.slice(0, -1);
    const last = keys[keys.length - 1];
    return { rest, last };
  }

  getCacheChild(keys: string[]) {
    return keys.reduce((cache, key) => {
      if (cache[key]) cache[key] = {};
      return cache[key];
    }, this.cache as any);
  }

  async getSet(req: Request, getter: Function) {
    // if data exists get, otherwise set cache to result of getter
    const { rest, last } = this.getKeys(req);
    const cache = this.getCacheChild(rest);
    if (cache[last]) return cache[last];
    const result = await getter();
    cache[last] = result;
    return result;
  }

  handleChange(req: Request) {
    // if req method is not GET, delete old data
    if (req.method === 'GET') return;
    const { rest, last } = this.getKeys(req);
    const cacheChild = this.getCacheChild(rest);
    delete cacheChild[last];
  }
}
