import { listnames, reviews, watched } from '@/drizzle/schema';
import { CacheData } from '@/lib/dataCache/cacheData';
import { ExistingMediaInfo } from '@/types';
import Cache from '@/lib/dataCache/cache';

// Move $inferSelect types to global types file
type MediaReview = typeof reviews.$inferSelect
type Listname = typeof listnames.$inferSelect
type ListItem = ExistingMediaInfo & { dateAdded: number }
type WatchedRec = typeof watched.$inferSelect & { title: string }
type UserReview = typeof reviews.$inferSelect & { title: string }

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
if (!globalThis.cacheV2Global) {
  console.log('SETTING CACHEV2')
  globalThis.cacheGlobal = cache;
}
