import {
  ExistingMediaInfo,
  ListItem,
  Listname,
  MediaReview,
  UserReview,
  WatchedRec
} from '@/types';
import { CacheData } from '@/lib/dataCache/cacheData';
import Cache from '@/lib/dataCache/cache';

// FIX ME, add undefined for all objects except root fields media and users
// any string key or resource (mediaInfo, listContents, etc..) could be undefined
export type CacheType = {
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
