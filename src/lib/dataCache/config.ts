import {
  ExistingMediaInfo,
  ListItem,
  Listname,
  Review,
  ReviewWithTitle,
  WatchedWithTitle,
} from '@/types';
import { CacheData } from '@/lib/dataCache/cacheData';
import Cache from '@/lib/dataCache/cache';

export type CacheType = {
  media: {
    [imdbId: string]: {
      mediaInfo: CacheData<ExistingMediaInfo>,
      reviews: CacheData<Review[]>,
    }
  },
  users: {
    [username: string]: {
      reviews: CacheData<ReviewWithTitle[]>,
      listnames: CacheData<Listname[]>,
      listContents: { [key: (string | number)] : CacheData<ListItem[]> },
      watched: CacheData<WatchedWithTitle[]>,
    }
  }
}

declare global {
  var cacheGlobal: Cache | undefined;
}
export const cache = (
  globalThis.cacheGlobal || new Cache()
);
if (!globalThis.cacheGlobal) {
  console.log('SETTING CACHEV2')
  globalThis.cacheGlobal = cache;
}
