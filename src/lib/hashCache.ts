import { reviews, watched } from '@/drizzle/schema';
import easyFetch from '@/lib/easyFetch';

type Hash = string
type Username = string
export type Resources = 'watched' | 'reviews'
export type Hashes = {
  hash: Hash,
  resources: { [K in Resources]: Hash }
}
type WatchedRec = typeof watched.$inferSelect & { title: string }
type ExistingReview = typeof reviews.$inferSelect & { title?: string }
export type UserDataTypes<T extends Resources> = {
  watched: WatchedRec[],
  reviews: ExistingReview[],
}[T]
export type UserData = { [K in Resources]: UserDataTypes<K> }
export type SyncResponse = { synced: boolean, needsSynced: Resources[] }

export async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

class HashTable {
  cache: { [key: Username]: Hashes }
  hash: (data: string) => Promise<string>

  constructor() {
    this.cache = {}
    this.hash = hash;
  }

  async setResource<K extends Resources>(username: string, resource: K, val: UserDataTypes<K>) {
    if (!this.cache[username]) this.cache[username] = {
      hash: '',
      resources: {
        watched: '',
        reviews: '',
      }
    };
    
    this.cache[username].resources[resource] = await this.hash(
      JSON.stringify(val)
    );
    this.cache[username].hash = await this.hash(
      JSON.stringify(this.cache[username].resources)
    );
  }
}

// export const hashTable: { [key: Username]: Hashes } = {}
export const hashTable = new HashTable();
if (!(globalThis as any).hashTable) {
  (globalThis as any).hashTable = hashTable;
}

export class ClientHashCache {
  hashes: Hashes;
  userData: UserData;
  fetchers: { [K in Resources]: () => Promise<UserDataTypes<K>> }

  constructor(username: string) {
    const { hashes, userData } = JSON.parse(localStorage.getItem('media-tracker') || JSON.stringify({}))
    this.hashes = hashes;
    this.userData = userData;
    this.fetchers = {
      watched: () => easyFetch<WatchedRec[]>({
        route: `/api/users/${username}/watched`,
        method: 'GET',
      }),
      reviews: () => easyFetch<ExistingReview[]>({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      }),
    }
  }

  async sync() {
    const syncState = await easyFetch({
      route: `/api/sync`,
      method: 'POST',
      body: this.hashes,
    });
    console.log('result', syncState)
    // if sync is good, return
    // if sync is not good, re-fetch resources and save synced state to localStorage
    // might wanna recheck sync state after re-fetching
    //  - make sure that doesn't turn into an infinite loop
  }
}

export class ServerHashCache {
  cache: { [key: Username]: Hashes }

  constructor() {
    this.cache = {}
  }
}

// import { reviews, watched } from '@/drizzle/schema';
// import easyFetch, { Methods } from '@/lib/easyFetch';
// import { ExistingMediaInfo } from '@/types';
// 
// // type UserResources = 'watched' | 'listnames'
// type Fetchs = { [K in Methods]?: Function }
// type Fetchers = {
//   [K in UserResources]: Fetchs
// }
// // type Cache = {
// //   hash: string,
// // } & Idk
// // type Idk = { cache: Cache } | { data: any }
// 
// type UserResources = 'watched' | 'lists' | 'reviews'
// type Cache = {
//   hash: string,
//   data: {
//     [K in UserResources]: {
//       hash: string,
//       data: CacheData<K>,
//     }
//   }
// }
// 
// type CacheData<T extends UserResources> = {
//   watched: WatchedRec[],
//   lists: ListContents,
//   reviews: ExistingReview[],
// }[T]
// 
// 
// type WatchedRec = typeof watched.$inferSelect & { title: string }
// type ExistingReview = typeof reviews.$inferSelect & { title?: string }
// type ListContents = {
//   [key: string]: {
//     hash: string,
//     data: ExistingMediaInfo[],
//   }
// }
// 
// function makeFetchers(username: string): Fetchers {
//   return {
//     watched: {
//       'GET': () => {
//         return easyFetch<WatchedRec[]>({
//           route: `/users/${username}/watched`,
//           method: 'GET'
//         })
//       }
//     },
//     lists: {
// 
//     },
//     reviews: {
// 
//     }
//   }
// }
// 
// type Routes = {
//   [K in UserResources]: {
//     [M in Methods]?: (username: string) => Promise<CacheData<K>>
//   }
// }
// const routes: Routes = {
//   watched: {
//     GET: (username) => {
//       return easyFetch({
//         route: `/api/users/${username}/watched`,
//         method: 'GET',
//       })
//     }
//   },
//   lists: {},
//   reviews: {
//     GET: (username) => {
//       return easyFetch({
//         route: `/api/users/${username}/reviews`,
//         method: 'GET',
//       })
//     }
//   }
// }
// 
// export class ClientHashCache {
//   username: string;
//   // cache: {
//   //   hash: string;
//   //   userData: {
//   //     watched: { hash: string, data: WatchedRec[] }
//   //     listnames: { hash: string, data: any }
//   //   }
//   // }
//   cache: Cache;
//   // cache: {
//   //   hash: string,
//   //   data: {
//   //     watched: { hash: string, data: WatchedRec[] },
//   //     lists: { hash: string, data: ListContents },
//   //     reviews: { hash: string, data: ExistingReview[] },
//   //   }
//   // }
//   // fetch: Fetchers;
//   isSynced: boolean;
// 
//   constructor(username: string) {
//     this.username = username;
//     // this.fetch = makeFetchers(username);
//     this.cache = JSON.parse(localStorage.getItem('mediaTracker') || '');
//     this.isSynced = false;
//     this.sync();
//   }
// 
//   getHashes() {
//     return {
//       hash: this.cache.hash,
//       data: {
//         watched: this.cache.data.watched.hash,
//         reviews: this.cache.data.reviews.hash,
//         lists: this.cache.data.lists.hash,
//       }
//     }
//   }
// 
//   async getUserData() {
//     const watched = await routes.watched.GET?.(this.username)!;
//     const reviews = await routes.reviews.GET?.(this.username)!;
//     this.cache = {
//       ...this.cache,
//       data: {
//         ...this.cache.data,
//         watched: {
//           hash: await this.hashData(watched),
//           data: watched,
//         },
//         reviews: {
//           hash: await this.hashData(reviews),
//           data: reviews,
//         }
//       }
//     }
//   }
// 
//   async hashData(data: any) {
//     const encoder = new TextEncoder();
//     const encodedData = encoder.encode(JSON.stringify(data));
//     const buffer = await crypto.subtle.digest('SHA-256', encodedData);
//     const byteArray = Array.from(new Uint8Array(buffer));
//     return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
//   }
// 
//   async sync() {
//     const res: Response = await easyFetch({
//       route: `/api/sync`,
//       method: 'GET',
//       skipJSON: true,
//       body: this.getHashes(),
//     });
//     if (!res.ok) {
//       // fetch data
//       this.getUserData();
//     } 
//     this.isSynced = true;
//   }
// }
// 
// const mockCache: Cache = {
//   hash: 'hashOfChildHashes',
//   data: {
//     watched: {
//       hash: 'hashOfWatchedRecords',
//       data: [],
//     },
//     lists: {
//       hash: 'hashOfListnames',
//       data: {
//         listname1: {
//           hash: 'hashOfListname1Contents',
//           data: [],
//         },
//         listname2: {
//           hash: 'hashOfListname2Contents',
//           data: [],
//         },
//       },
//     },
//     reviews: {
//       hash: 'hashOfReviews',
//       data: []
//     }
//   },
// }
// 
// type Username = string
// type Hash = string
// type ServerCache = {
//   hash: string,
//   data: {
//     [K in UserResources]: {
//       hash: string,
//     }
//   }
// }
// type HashObj = { [K in UserResources | 'hash']: Hash }
// 
// export class ServerHashCache {
//   cache: { [key: Username]: ServerCache }
// 
//   constructor() {
//     this.cache = {}
//   }
// 
//   checkSync(username: string, hashObj: HashObj) {
//     const serverHashes = this.cache[username];
//     const { hash, ...resources } = hashObj;
//     if (serverHashes.hash === hash) {
//       // full hash matches, all data is synced
//       return true;
//     }
// 
//     // check which keys are out of sync
//     const outOfSync = (Object.keys(resources) as UserResources[]).filter(key => {
//       return serverHashes.data[key].hash === resources[key];
//     })
// 
//     if (outOfSync.includes('lists')) {
//       // crawl lists to determine which ones are out of sync
//     }
//   }
// }
