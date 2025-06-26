import { listnames, reviews, watched } from '@/drizzle/schema';
import /*easyFetch,*/ { Methods } from '@/lib/easyFetch';

type Hash = string
type Username = string
const immutableResources = [ 'watched', 'reviews', 'listnames' ] as const
export type Resources = typeof immutableResources[number]
export const resources = [ ...immutableResources ];

export type Hashes = {
  hash: Hash,
  resources: { [K in Resources]: Hash }
}
type WatchedRec = typeof watched.$inferSelect & { title?: string }
type ExistingReview = typeof reviews.$inferSelect & { title?: string }
type Review = typeof reviews.$inferInsert
type ReviewBody = Omit<Omit<Omit<Review, 'username'>, 'imdbId'>, 'date'>
type Listname = typeof listnames.$inferSelect
// export type UserDataTypes<T extends Resources> = {
//   watched: WatchedRec[],
//   reviews: ExistingReview[],
// }[T]
// export type UserData = { [K in Resources]: UserDataTypes<K> }

type FillWith<T extends Partial<Record<Methods, any>>, F> = {
  [K in Methods]: K extends keyof T ? T[K] : F
}

// Maybe rename this to ResourceResTypes
// because this is what we get back from the API
export type ResourceTypes<T extends Resources, K extends Methods> = {
  watched: FillWith<{
    GET: WatchedRec[],
    POST: WatchedRec,
    DELETE: { id: number },
  }, undefined>,
  reviews: FillWith<{
    GET: ExistingReview[],
    POST: ExistingReview,
    PUT: ExistingReview,
    DELETE: { imdbId: string },
  }, undefined>,
  listnames: FillWith<{
    GET: Listname[],
    POST: Listname,
    PUT: { listname: string, newListname: string },
    DELETE: { listname: string },
  }, undefined>
}[T][K]

// Maybe rename this to ResourceReqTypes
// because this is what we send to the API
export type ResourceInputTypes<T extends Resources, K extends Methods> = {
  watched: FillWith<{
    POST: { imdbId: string },
    DELETE: { id: number },
  }, undefined>
  reviews: FillWith<{
    POST: ReviewBody & { imdbId: string },
    PUT: ReviewBody & { imdbId: string },
    DELETE: { imdbId: string },
  }, undefined>,
  listnames: FillWith<{
    POST: { listname: string },
    PUT: { listname: string, newListname: string },
    DELETE: { listname: string },
  }, undefined>
}[T][K]

export type UserData = {
  hash: Hash,
  data: {
    [K in Resources]: {
      hash: Hash,
      data: ResourceTypes<K, 'GET'>
    }
  }
}
export type SyncResponse = { synced: boolean, needsSynced: Resources[] }

export async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Rename this to ServerHashCache
// Create ClientHashCache with methods from userData context file
//  - class will need to take external state and setState as constructor args to make everything work
class HashTable {
  cache: { [key: Username]: Hashes }
  hash: (data: string) => Promise<string>

  constructor() {
    this.cache = {}
    this.hash = hash;
  }

  async setResource<K extends Resources>(username: string, resource: K, val: ResourceTypes<K, 'GET'>) {
    if (!this.cache[username]) this.cache[username] = {
      hash: '',
      resources: {
        watched: '',
        reviews: '',
        listnames: '',
      }
    };
    
    this.cache[username].resources[resource] = await this.hash(
      JSON.stringify(val)
    );
    await this.updateMasterHash(username);
    // this.cache[username].hash = await this.hash(
    //   JSON.stringify(this.cache[username].resources)
    // );
  }

  async updateMasterHash(username: string) {
    this.cache[username].hash = await this.hash(
      JSON.stringify(this.cache[username].resources)
    );
    // console.log('after updating hashes', this.cache[username])
  }

  async updateResource<K extends Resources, M extends Methods>(
    username: string,
    resource: K,
    method: M,
    record: ResourceTypes<K, M>
  ) {
    const userHashes = this.cache[username];
    // console.log(`old hash for ${resource}:`, userHashes.resources.watched)
    const oldHash = userHashes.resources[resource];
    const hashString = `${oldHash},${method},${JSON.stringify(record)}`
    // console.log('hash string', hashString)
    const newHash = await this.hash(hashString);
    // console.log(`new hash for ${resource}:`, newHash)
    userHashes.resources[resource] = newHash;
    await this.updateMasterHash(username);
    // console.log('new hashes', userHashes);
  }
}

// export const hashTable: { [key: Username]: Hashes } = {}
export const hashTable = new HashTable();
if (!(globalThis as any).hashTable) {
  (globalThis as any).hashTable = hashTable;
}

// export class ClientHashCache {
//   hashes: Hashes;
//   userData: UserData;
//   fetchers: { [K in Resources]: () => Promise<UserDataTypes<K>> }
// 
//   constructor(username: string) {
//     const { hashes, userData } = JSON.parse(localStorage.getItem('media-tracker') || JSON.stringify({}))
//     this.hashes = hashes;
//     this.userData = userData;
//     this.fetchers = {
//       watched: () => easyFetch<WatchedRec[]>({
//         route: `/api/users/${username}/watched`,
//         method: 'GET',
//       }),
//       reviews: () => easyFetch<ExistingReview[]>({
//         route: `/api/users/${username}/reviews`,
//         method: 'GET',
//       }),
//     }
//   }
// 
//   async sync() {
//     const syncState = await easyFetch({
//       route: `/api/sync`,
//       method: 'POST',
//       body: this.hashes,
//     });
//     console.log('result', syncState)
//     // if sync is good, return
//     // if sync is not good, re-fetch resources and save synced state to localStorage
//     // might wanna recheck sync state after re-fetching
//     //  - make sure that doesn't turn into an infinite loop
//   }
// }
// 
// export class ServerHashCache {
//   cache: { [key: Username]: Hashes }
// 
//   constructor() {
//     this.cache = {}
//   }
// }

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
