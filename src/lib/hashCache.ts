import { reviews, watched } from '@/drizzle/schema';
import easyFetch, { Methods } from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';

// type UserResources = 'watched' | 'listnames'
type Fetchs = { [K in Methods]?: Function }
type Fetchers = {
  [K in UserResources]: Fetchs
}
// type Cache = {
//   hash: string,
// } & Idk
// type Idk = { cache: Cache } | { data: any }

type UserResources = 'watched' | 'lists' | 'reviews'
type Cache = {
  hash: string,
  data: {
    [K in UserResources]: {
      hash: string,
      data: CacheData<K>,
    }
  }
}

type CacheData<T extends UserResources> = {
  watched: WatchedRec[],
  lists: ListContents,
  reviews: ExistingReview[],
}[T]


type WatchedRec = typeof watched.$inferSelect & { title: string }
type ExistingReview = typeof reviews.$inferSelect & { title?: string }
type ListContents = {
  [key: string]: {
    hash: string,
    data: ExistingMediaInfo[],
  }
}

function makeFetchers(username: string): Fetchers {
  return {
    watched: {
      'GET': () => {
        return easyFetch<WatchedRec[]>({
          route: `/users/${username}/watched`,
          method: 'GET'
        })
      }
    },
    lists: {

    },
    reviews: {

    }
  }
}

type Routes = {
  [K in UserResources]: {
    [M in Methods]?: (username: string) => Promise<CacheData<K>>
  }
}
const routes: Routes = {
  watched: {
    GET: (username) => {
      return easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'GET',
      })
    }
  },
  lists: {},
  reviews: {
    GET: (username) => {
      return easyFetch({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      })
    }
  }
}

export default class ClientHashCache {
  username: string;
  // cache: {
  //   hash: string;
  //   userData: {
  //     watched: { hash: string, data: WatchedRec[] }
  //     listnames: { hash: string, data: any }
  //   }
  // }
  cache: Cache;
  // cache: {
  //   hash: string,
  //   data: {
  //     watched: { hash: string, data: WatchedRec[] },
  //     lists: { hash: string, data: ListContents },
  //     reviews: { hash: string, data: ExistingReview[] },
  //   }
  // }
  // fetch: Fetchers;
  isSynced: boolean;

  constructor(username: string) {
    this.username = username;
    // this.fetch = makeFetchers(username);
    this.cache = JSON.parse(localStorage.getItem('mediaTracker') || '')
    this.isSynced = false;
    this.sync()
  }

  getHashes() {
    return {
      hash: this.cache.hash,
      data: {
        watched: this.cache.data.watched.hash,
        reviews: this.cache.data.reviews.hash,
        lists: this.cache.data.lists.hash,
      }
    }
  }

  getUserData() {
    // const watched = 
  }

  async sync() {
    const res: Response = await easyFetch({
      route: `/api/sync`,
      method: 'GET',
      skipJSON: true,
      body: this.getHashes(),
    });
    if (!res.ok) {
      // fetch data
      this.getUserData();
    } 
    this.isSynced = true;
  }
}

const mockCache: Cache = {
  hash: 'hashOfChildHashes',
  data: {
    watched: {
      hash: 'hashOfWatchedRecords',
      data: [],
    },
    lists: {
      hash: 'hashOfListnames',
      data: {
        listname1: {
          hash: 'hashOfListname1Contents',
          data: [],
        },
        listname2: {
          hash: 'hashOfListname2Contents',
          data: [],
        },
      },
    },
    reviews: {
      hash: 'hashOfReviews',
      data: []
    }
  },
}
