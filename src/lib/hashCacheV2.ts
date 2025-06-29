import { listnames, lists, reviews, watched } from '@/drizzle/schema';
import easyFetch, { Methods } from '@/lib/easyFetch';
import { Dispatch, SetStateAction } from 'react';

type Username = string
type Hash = string
type Hashes<T> = { [K in keyof T]: Hash | Hashes<string> }
type HashResult = { [key: string]: boolean | HashResult }
// try to use this instead of Hashes and HashResult
// type Hashes<T, F> = { [K in keyof T]: F | Hashes<T, F> }
type HashObj<T extends string[]> = { [K in T[number]]: any }
type BetterHashes<T extends ConfigGeneric> = {
  // [K in keyof T]: T[K]['nested'] extends true ? { [key: string]: string } : string
  [K in keyof T]: T[K] extends { nested: true } ? { [key: string]: string } : string
}
type TrustMe = any

// const resources = [ 'watched', 'reviews', 'lists' ] as const;
// type Resources = typeof resources[number]

type WatchedRec = typeof watched.$inferSelect & { title?: string }
type ExistingReview = typeof reviews.$inferSelect & { title?: string }
type Listname = typeof listnames.$inferSelect
// type ListItem = typeof lists.$inferSelect
// type Lists = {
//   [key: string]: {
//     listname: Listname,
//     listContents: ListItem,
//   }
// }
const config = {
  watched: {
    fetch: {
      GET: (username: string) => easyFetch<WatchedRec[]>({
        route: `/api/users/${username}/watched`,
        method: 'GET',
      }),
    }
  },
  reviews: {
    fetch: {
      GET: (username: string) => easyFetch<ExistingReview[]>({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      }),
    }
  },
  lists: {
    nested: true,
    fetch: {
      GET: (username: string) => easyFetch<Listname[]>({
        route: `/api/users/${username}/lists`,
        method: 'GET',
      }),
      // GET: (username: string, listname?: string) => {
      //   if (!listname) {
      //     // get and set all lists
      //   } else {
      //     return easyFetch<ListItem[]>({
      //       route: `/api/users/${username}/lists/${listname}`,
      //       method: 'GET',
      //     }).then(listContents => {})
      //   }
      // }
    }
  },
} as const

async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function getType(item: any) {
  if (Array.isArray(item)) return 'array';
  if (item === null) return 'null';
  return typeof item;
}

// export class HashCache<T> {
//   server: ServerHashCache
//   client: ClientHashCache
// 
//   constructor(config: T) {
//     this.server = new ServerHashCache();
//     this.client = new ClientHashCache();
//   }
// }

type ExtractReturnType<
  T extends ConfigGeneric,
  K extends keyof T,
  M extends keyof T[K]['fetch'],
> =
  T[K]['fetch'][M] extends AsyncFunction
    ? Awaited<ReturnType<T[K]['fetch'][M]>>
      : never

export class ServerHashCache<T extends ConfigGeneric> {
  cache: { [key: Username]: BetterHashes<T> }
  hash: typeof hash
  config: T
  emptyHashes: BetterHashes<T> 

  constructor(config: T) {
    this.cache = {};
    this.hash = hash;
    this.config = config;
    this.emptyHashes = Object.keys(config).reduce((emptyHash, key) => {
      const isNested = config[key].nested;
      emptyHash[key] = isNested ? {} : '';
      return emptyHash;
    }, {} as TrustMe)
  }

  compareHashes(keys: string[], serverHashes: HashObj<typeof keys>, clientHashes: HashObj<typeof keys>) {
    return keys.reduce((hashResult, resource) => {
      const serverType = getType(serverHashes[resource]);
      const clientType = getType(clientHashes[resource]);
      if (serverType !== clientType) {
        throw Error(`Type mismatch comparing hashes`);
      }
      if (serverType === 'string') {
        hashResult[resource] = serverHashes[resource] === clientHashes[resource]
      } else if (serverType === 'object') {
        const keys = Object.keys(serverHashes[resource])
        hashResult[resource] = this.compareHashes(keys, serverHashes[resource], clientHashes[resource])
      }
      return hashResult
    }, {} as HashResult);
  }

  async updateResource<K extends keyof T, M extends keyof T[K]['fetch']>(
    username: string,
    resource: K,
    method: M,
    record: ExtractReturnType<T, K, M>
  ) {
    // handle case where this.cache[username] does not exist
    if (!this.cache[username]) {
      this.cache[username] = this.emptyHashes;
    }
    const userCache = this.cache[username];

    const type = typeof userCache[resource]
    // if (type === 'string') {
    //   // because it's not like I just checked to see if it was a string or not,
    //   // totally possible something that isn't a string would have typeof = string
    //   (userCache[resource] as string) = await hash(
    //     `${userCache[resource]},${String(method)},${JSON.stringify(record)}`
    //   )
    // } else if (type === 'object') {
    //   if (method === 'Get') {

    //   }
    //   (userCache[resource] as { [key: string]: string })[record.listname] = await hash(
    //     `${userCache[resource]},${String(method)},${JSON.stringify(record)}`
    //   )
    // }
  }
}

type AsyncFunction = (...args: any[]) => Promise<any>
type ConfigGeneric = {
  [key: string]: {
    nested?: boolean,
    fetch: { [M in Methods]?: AsyncFunction }
  }
}
type ExtractUserData<T extends ConfigGeneric> = {
  [K in keyof T]: T[K]['fetch'] extends { GET: AsyncFunction }
    ? Awaited<ReturnType<T[K]['fetch']['GET']>>
      : never
}
type UserData<T extends ConfigGeneric> = ExtractUserData<T> | undefined
type SavedState<T extends ConfigGeneric> = {
  hashes: Hashes<T> | undefined,
  userData: ExtractUserData<T> | undefined
}

export class ClientHashCache<T extends ConfigGeneric> {
  username: string
  hash: typeof hash
  hashes?: Hashes<T>
  userData: UserData<T>
  setUserData: Dispatch<SetStateAction<UserData<T>>>
  storageKey = 'media-tracker'
  config: T

  constructor(
    username: string,
    config: T,
    userData: UserData<T>,
    setUserData: Dispatch<SetStateAction<UserData<T>>>
  ) {
    this.username = username
    this.hash = hash
    this.config = config;
    this.userData = userData;
    this.setUserData = setUserData;
    this.load();
  }

  load() {
    const savedState: SavedState<T> = JSON.parse(
      localStorage.getItem(this.storageKey) || JSON.stringify({})
    );
    const { hashes, userData } = savedState;
    this.hashes = hashes;
    this.userData = userData;
    this.sync(this.username);
  }

  async sync(username: string, retryCount = 0, maxRetryCount = 5): Promise<void> {
    if (retryCount === maxRetryCount) throw Error('not synced, too many retries');

    const hashResult = await easyFetch<HashResult>({
      route: '/api/sync',
      method: 'POST',
      body: this.hashes
    })

    function isSynced(hashResult: HashResult) {
      return Object.keys(hashResult).reduce((needsUpdated, key) => {
        const val = hashResult[key];
        const valType = getType(val);
        if (valType === 'boolean' && !val) return needsUpdated;
        needsUpdated[key] = isSynced(val as HashResult);
        return needsUpdated;
      }, {} as HashResult);
    }

    if (isSynced(hashResult)) {
      console.log('SYNC SUCCESSFUL')
      return;
    }

    // get fields to update
    // update fields
    // recurse
    // return this.sync(username, retryCount + 1);
  }

  updateResources(hashes: BetterHashes<T>, keys = []) {
    if (!this.userData) throw Error('userData is undefined');
    Object.keys(hashes).reduce((userData, key) => {
      const val = hashes[key];
      if (val === 'boolean') {
        if (!hashes[key]) {
          const getFunc = this.config[key].fetch['GET'];
          if (!getFunc) throw Error(`Could not find fetch GET method for ${key}`);
          (userData[key] as TrustMe) = getFunc(this.username);
        }
      } else {
        // val is object

      }
      return userData
    }, this.userData)
  }

  // crawlAndUpdate(hashes: HashResult) {
  //   Object.keys(hashes).forEach(async key => {
  //     if (!this.userData) throw Error('userData is undefined')
  //     const val = hashes[key];
  //     if (typeof val === 'boolean') {
  //       if (!val) {
  //         const getFunc = this.config[key].fetch.GET
  //         if (!getFunc) throw Error(`No GET function found for ${key}`);
  //         (this.userData[key] as TrustMe) = await getFunc(this.username);
  //       }
  //     }
  //   })
  // }
}

// TESTING
const one = {
  watched: 'watchedHash',
  reviews: 'reviewHash',
  listContents: {
    listname1: 'listname1Hash',
    listname2: 'listname2Hash',
  }
}
const two = {
  watched: 'watchedHash',
  reviews: 'reviewHashDIFFERENT',
  listContents: {
    listname1: 'listname1Hash',
    listname2: 'listname2HashDIFFERENT',
  }
}
const result = {
  watched: true,
  reviews: false,
  listContents: {
    listname1: true,
    listname2: false,
  }
}

function compareHashes(keys: string[], serverHashes: HashObj<typeof keys>, clientHashes: HashObj<typeof keys>) {
  return keys.reduce((hashResult, resource) => {
    const serverType = getType(serverHashes[resource]);
    const clientType = getType(clientHashes[resource]);
    if (serverType !== clientType) {
      throw Error(`Type mismatch comparing hashes`);
    }
    if (serverType === 'string') {
      hashResult[resource] = serverHashes[resource] === clientHashes[resource]
    } else if (serverType === 'object') {
      const keys = Object.keys(serverHashes[resource])
      hashResult[resource] = compareHashes(keys, serverHashes[resource], clientHashes[resource])
    }
    return hashResult
  }, {} as HashResult);
}

function isSynced(hashResult: HashResult) {
  console.log('checking', hashResult)
  return Object.keys(hashResult).reduce((needsUpdated, key) => {
    const val = hashResult[key];
    const valType = getType(val);
    if (valType === 'boolean') {
      if (!val) {
        console.log('val is false', key);
        needsUpdated[key] = val;
      }
      return needsUpdated;
    }
    needsUpdated[key] = isSynced(val as HashResult);
    return needsUpdated;
  }, {} as HashResult);
}

// const comparison = compareHashes(Object.keys(one), one, two)
// console.log(comparison)
// const needsUpdated = isSynced(comparison)
// console.log(needsUpdated)

// const clientHashCache = new ClientHashCache('user1', config)
// const serverHashCache = new ServerHashCache(config)

// const testHashObj: BetterHashes<typeof config> = {
//   watched: '',
//   reviews: '',
//   lists: {},
// }
