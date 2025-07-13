// ROUND 4, FIGHT
//
// How is this even supposed to work?  If you can't describe it, you can't make it
// There are 3 possible sync states
// - NoData: Server has no data will return null
// - PartialSync: Server has data, but some hashes do not match
//    - For the most part this should only really happen when user changes devices
//      - In all other cases localState should be kept up to date through maintaining userData
// - FullSync: Server has data and all hashes match clientHashes
//
// How do we handle updating each possible sync state?
// NoData: fetch all resources
//  - will need some base for resources, null value does not tell us what resources are available
// PartialSync: find mismatching resources and update them
//  - How do we handle a resource like listContents?
//    - feels like it might be a good idea to go back to nesting
//  - How do we determine getter funcs for something like listContents?
//    - if we have a key like list-1, we could harvest the id number and pass it as an argument to getter func
//      - but this is problematic for initial fetching, the key does not exist yet so nothing to harvest
// FullSync: Do nothing, everything is up to date
//
// General work flow for updating a resource:
// call config func for resource, assign return value to userData[resource]
// after userData[resource] is set, update hasehes[resource]
//  - if method is GET, we just set it to the hash of userData
//  - otherwise, set hash to hash(existingResource + method + newResource)
//
// What should config look like?
// Each resource gets a key, but we need to be able to partially match keys
//  - list-listId needs to call the functions from config.lists
// Should config funcs return the resource or set them within the function?
//  - if we set the resource within the function, we should also handle hash updates there
//
// The main problem we have is how to get and update listContents items

import { listnames, lists, watched } from '@/drizzle/schema';
import easyFetch, { Methods } from '@/lib/easyFetch';
// import { ExistingMediaInfo } from '@/types'

// might need to design how we return listContents
// We want an array of imdbId, not the mediaInfo
// tables should fetch mediaInfo when rendered

type Listname = typeof listnames.$inferSelect
type ListItem = typeof lists.$inferSelect

const resources = [ 'listnames', 'lists' ] as const
type ResourceKeys = typeof resources | string

type SavedState = { hashes: Hashes, userData: UserData }
type ListId = string;
type UserData = {
  listnames: Listname[],
} & {
  [key: ListId]: ListItem[],
}
type Hashes = {
  listnames: string,
} & {
  [key: ListId]: string,
}

const testParams = { testType: 'userContext' }

const config = {
  listnames: {
    match: /^listnames$/,
    GET: async (clientHashCache: ClientHashCache) => {
      console.log('setting listnames')
      // return await easyFetch<Listname[]>({
      //   route: `/api/users/${clientHashCache.username}/lists`,
      //   method: 'GET',
      //   params: testParams,
      // });

      const resources = await easyFetch<Listname[]>({
        route: `/api/users/${clientHashCache.username}/lists`,
        method: 'GET',
        params: testParams,
      });
      clientHashCache.userData.listnames = resources;
      await clientHashCache.updateHash('listnames', 'GET', resources);
    }
  },
  lists: {
    match: /^lists-(\d+)$/,
    // GET: async (clientHashCache: ClientHashCache, listId: number) => {
    //   console.log('setting listContents')
    //   return await easyFetch<ListItem[]>({
    //     route: `/api/users/${clientHashCache.username}/lists/${listId}`,
    //     method: 'GET',
    //     params: testParams,
    //   });
    // },
    GET: async (clientHashCache: ClientHashCache) => {
      console.log('setting listContents')
      clientHashCache.userData.listnames.forEach(async listname => {
        const resources = await easyFetch<ListItem[]>({
          route: `/api/users/${clientHashCache.username}/lists/${listname.id}`,
          method: 'GET',
          params: testParams,
        });
        const hashCacheKey = `list-${listname.id}`;
        clientHashCache.userData[hashCacheKey] = resources;
        await clientHashCache.updateHash(hashCacheKey, 'GET', resources);
      })
    },
    POST: async (clientHashCache: ClientHashCache, record: { imdbId: string, listnameId: number, listname: string }) => {
      const newRecord = await easyFetch<ListItem>({
        route: `/api/users/${clientHashCache.username}/lists/${record.listname}`,
        method: 'POST',
      });
      const hashCacheKey = `list-${record.listnameId}`;
      clientHashCache.userData[hashCacheKey].push(newRecord);
      await clientHashCache.updateHash(hashCacheKey, 'POST', newRecord);
      // clientHashCache.sync();
    },
  }
}

const modHandlers = {
  GET: (existing: any, set: any) => set,
  POST: (existing: any, set: any) => existing.push(set),
}

async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export class ClientHashCache {
  username: string
  userData: UserData
  hashes: Hashes
  storageKey = 'media-tracker'

  constructor(username: string) {
    this.username = username;
    const { userData, hashes } = this.getSavedState();
    this.userData = userData;
    this.hashes = hashes;
    this.sync();
  }

  getSavedState(): SavedState {
    const { hashes, userData }: SavedState = JSON.parse(
      localStorage.getItem(this.storageKey) || JSON.stringify({})
    )[this.username] || {};

    if (hashes || userData) {
      console.log('FOUND SAVED STATE', { hashes, userData })
    }

    return {
      hashes: hashes || {},
      userData: userData || {},
    }
  }

  setSavedState() {
    const existingState = localStorage.getItem(this.storageKey);
    const obj = JSON.parse(existingState || JSON.stringify({}));
    const { userData, hashes } = this;
    obj[this.username] = { userData, hashes };
    localStorage.setItem(this.storageKey, JSON.stringify(obj));
  }

  async sync(): Promise<void> {
    const serverHashes = await easyFetch<Hashes | null>({
      route: '/api/sync',
      method: 'GET',
    });
    console.log('serverHashes', serverHashes)

    if (!serverHashes) {
      // this.initialSync()
      for (const resource of resources) {
        await config[resource].GET(this);
        await this.updateHash(resource, 'GET', this.userData[resource]);
        // await this.updateResource(resource, 'GET', undefined);
      }
      console.log('INITIAL SYNC COMPLETE')
      return this.sync();
    }

    // Server should always have the most up to date data
    const isSynced = Object.keys(serverHashes).filter(resource => {
      const mismatch = this.hashes[resource] !== serverHashes[resource];
      if (mismatch) {
        console.log(resource, this.hashes[resource], serverHashes[resource])
      }
      return mismatch;
    });

    if (!isSynced.length) {
      console.log('SYNC SUCCESSFUL')
      this.setSavedState();
      return;
    }

    console.log('out of sync keys', isSynced)
    isSynced.forEach(resourceKey => {
      // find keys that mismatch and update associated resource
    })
    // this.sync();
  }

  async updateHash(resource: string, method: string, data: any) {
    if (method === 'GET') {
      this.hashes[resource] = await hash(JSON.stringify(data));
    } else {
      this.hashes[resource] = await hash(
        `${this.hashes[resource]},${method},${JSON.stringify(data)}`
      );
    }
  }

  async updateResource(resource: string, method: string, data: any) {
    // const result = await (config as any)[resource][method](this, data);
    // this.userData[resource] = data;
    (modHandlers as any)[resource](this.userData[resource], data);
    this.updateHash(resource, method, data);
    this.sync();
  }

  async initialSync() {
    const listnames = await config.listnames.GET(this);
    // const listContents = await Promise.all(
    //   listnames.map(async listname => await config['lists'].GET(this, listname.id))
    // );
    // console.log(listnames, listContents)
    // await this.updateResource('listnames', 'GET', listnames)
    // await Promise.all(
    //   listContents.map(async listContent => {
    //     // WHAT AM I SUPPOSED TO DO
    //   })
    // )
  }
}

class ServerHashCache {
  cache: { [key: string]: Hashes }

  constructor() {
    this.cache = {};
  }

  async updateHash(username: string, resource: string, method: string, data: any) {
    if (!this.cache[username]) this.cache[username] = {} as Hashes
    if (method === 'GET') {
      this.cache[username][resource] = await hash(JSON.stringify(data));
    } else {
      this.cache[username][resource] = await hash(
        `${this.cache[username][resource]},${method},${JSON.stringify(data)}`
      );
    }
  }
}

// export const serverHashCache = new ServerHashCache();
// if (!(globalThis as any).serverHashCache) {
//   (globalThis as any).serverHashCache = serverHashCache;
// }

// const myConfig = {
//   lists: {
//     link: `/api/users/tedifer_jones/lists`,
//     fetch: {
//       GET: () => ({ params: testParams }),
//     }
//   }
// }

// type AsyncFunc = (...args: any) => Promise<any>
type FetchFuncs = { [key: string]: Function }
export class Resource {
  link: string;
  fetch: FetchFuncs;
  data: any;
  hash: any;

  constructor(link: string, fetch: FetchFuncs) {
    this.link = link;
    this.fetch = fetch;
    this.updateResource('GET');
  }

  async updateResource(method: string, ...args: any[]) {
    // const data = await this.fetch[method](...args);
    const data = await this.req(method as Methods);
    this.data = data;
    if (method === 'GET') {
      this.hash = await hash(JSON.stringify(data));
    } else {
      this.hash = await hash(
        `${this.hash},${method},${JSON.stringify(data)}`
      );
    }
    return this;
  }

  async req(method: Methods) {
    return await easyFetch({
      route: this.link,
      method,
      ...this.fetch[method]()
    });
  }
}

export class ClientHashCacheV2 {
  cache: { [key: string]: Resource }
  initFunc: (a: ClientHashCacheV2) => Promise<any>

  constructor(initFunc: (a: ClientHashCacheV2) => Promise<any>) {
    this.cache = {};
    this.initFunc = initFunc;
    this.sync();
    // initFunc(this).then(() => this.sync());
  }

  get(key: string) {
    return this.cache[key].data;
  }

  add(key: string, val: Resource) {
    this.cache[key] = val;
  }

  async sync(): Promise<void> {
    const syncState = await easyFetch<{ [key: string]: string } | null>({
      route: '/api/sync',
      method: 'GET',
    });
    console.log('SYNC STATE', syncState);

    if (!syncState) {
      console.log('no server hashes, running init func')
      this.initFunc(this);
      this.sync();
      return;
    }

    const outOfSync = Object.keys(syncState).filter(key => {
      if (!this.cache?.[key]?.hash) {
        throw Error(`cant find hash for: ${key}`)
      }
      return syncState[key] !== this.cache[key].hash;
    });
    console.log('outOfSync', outOfSync)

    if (outOfSync.length === 0) {
      console.log('SYNC SUCCESSFUL')
      this.saveState();
      return;
    }

    await Promise.all(
      outOfSync.map(key => this.cache[key].updateResource('GET'))
    );
    this.sync();
  }

  loadState() {

  }

  saveState() {

  }

  // async req(obj: Resource, method: string) {
  //   return await easyFetch({
  //     route: obj.link,
  //     method: method as Methods,
  //     ...obj.fetch[method](),
  //   });
  // }
}

// const myConfig = classConfig('tedifer_jones');
// console.log({ myConfig })

// const setup = {
//   lists: new Resource(
//     '/api/users/tedifer_jones/lists',
//     {
//       GET: () => ({ params: testParams })
//     }
//   )
// }

export async function initFunc(hashCache: ClientHashCacheV2) {
  // const cache: ClientHashCacheV2['cache'] = {};
  const listnames = new Resource(
    '/api/users/tedifer_jones/lists',
    {
      GET: () => ({ params: testParams })
    }
  );
  hashCache.add('listnames', await listnames.updateResource('GET'));

  await Promise.all(
    (listnames.data as Listname[]).map(async listname => {
      const list = new Resource(
        `/api/users/tedifer_jones/lists/${listname.id}`,
        {
          GET: () => ({ params: testParams })
        }
      );
      hashCache.add(`list-${listname.id}`, await list.updateResource('GET'));
    })
  );
}

type ServerHashesV3 = {
  listnames: string,
  listContents: { [listId: number]: string }
}
type IndexableObj = { [key: string | number]: string }

const storageKey = 'media-tracker';
export class ClientHashCacheV3 {
  username: string;
  cache: {
    listnames: {
      hash: string,
      data: Listname[],
    },
    listContents: {
      [listId: number]: {
        hash: string,
        data: ListItem[],
      }
    }
  } = {} as any

  constructor(username: string) {
    this.username = username;
    this.loadState();
    this.checkSync();
  }

  loadState() {
    console.log('localStorage', localStorage)
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      const userData = JSON.parse(savedState)[this.username];
      if (userData) {
        this.cache = userData;
        return;
      }
    }
  }

  async checkSync() {
    const serverHashes = await easyFetch<ServerHashesV3 | null>({
      route: '/api/sync',
      method: 'GET',
    });
    console.log(serverHashes)
    if (!serverHashes) {
      this.getAll();
      // this.checkSync();
      return
    }

    const { listContents: serverLists, ...checkable } = serverHashes;
    const { listContents: clientLists, ...clientCheckable } = this.getHashes();
  }

  getHashes(): ServerHashesV3 {
    return {
      listnames: this.cache.listnames.hash,
      listContents: Object.keys(this.cache.listContents).reduce((hashes, listId) => {
        const numListId = Number(listId);
        hashes[numListId] = this.cache.listContents[numListId].hash;
        return hashes;
      }, {} as IndexableObj)
    }
  }

  compareObjects(main: IndexableObj, check: IndexableObj) {
    // check that all keys in main exist on check and values match
    // what do we do if check has keys that do not exist on main?
    return Object.keys(main).filter(key => {
      return main[key] === check[key]
    });
  }

  async getAll() {
    const listnames = await easyFetch<Listname[]>({
      route: `/api/users/${this.username}/lists`,
      method: 'GET',
      params: testParams,
    });
    console.log(listnames)

    const listContents = Object.fromEntries(
      await Promise.all(
        listnames.map(async listname => {
          return [
            listname.id,
            await easyFetch({
              route: `/api/users/${this.username}/lists/${listname.id}`,
              method: 'GET',
              params: testParams,
            })
          ]
        })
      )
    );

    this.cache = {
      listnames: {
        data: listnames,
        hash: await hash(JSON.stringify(listnames))
      },
      listContents: Object.fromEntries(
        await Promise.all(
          Object.keys(listContents).map(async key => {
            return [
              key,
              {
                data: listContents[key],
                hash: await hash(JSON.stringify(listContents[key]))
              }
            ]
          }, {} as { [key: number]: { data: ListItem[], hash: string } })
        )
      )
    }
    console.log(this.cache)
  }
}

export const configV2 = {
  resources: {
    listnames: {
      compare(client, server) {
          
      },
      fetch: {
        GET: async (hashCache, serverHashes) => {
          if (serverHashes && hashCache.hashes.listnames === serverHashes.listnames) {
            // hashes match, do nothing
            return [] as Listname[];
          }
          hashCache.isSynced = false;
          const results = await easyFetch<Listname[]>({
            route: `/api/users/${hashCache.username}/lists`,
            method: 'GET',
            params: testParams,
          });
          hashCache.resources.listnames = results;
          hashCache.hashes.listnames = await hashCache.config.hashFunc(
            JSON.stringify(results)
          );
          return results
        },
        POST: async (hashCache, _, record: { listname: string }) => {
          const newRecord = await easyFetch<Listname>({
            route: `/api/users/${hashCache.username}/lists`,
            method: 'POST',
            params: testParams,
            body: record,
          });
          hashCache.resources.listnames.push(newRecord);
          hashCache.hashes.listnames = await hashCache.config.hashFunc(
            `${JSON.stringify(hashCache.hashes.listnames)},POST,${newRecord}`
          );
        },
      },
    },
    listContents: {
      key: 'listnameId',
      compare(client, server) {
          
      },
      fetch: {
        GET: async (hashCache, serverHashes) => {
          if (!hashCache.resources.listnames) {
            throw Error('listnames does not exist');
          }

          if (!hashCache.resources.listContents) {
            hashCache.resources.listContents = {};
          }
          if (!hashCache.hashes.listContents) {
            hashCache.hashes.listContents = {};
          }

          let needsSyncedListIds = (hashCache.resources.listnames as Listname[]).map(listname => listname.id.toString())
          if (serverHashes) {
            needsSyncedListIds = (
              Object.keys(serverHashes).filter(listId => {
                // this should be serverHashes.listContents[listId]
                return serverHashes[listId] && hashCache.hashes.listContents[listId]
                  && serverHashes[listId] !== hashCache.hashes.listContents[listId];
              })
            );
          }

          if (needsSyncedListIds.length !== 0) {
            hashCache.isSynced = false;
          }

          // these fetchs can probably be done in parallel
          // for (const listname of hashCache.resources.listnames as Listname[]) {
          for (const listId of needsSyncedListIds) {
            const data = await easyFetch<ListItem[]>({
              route: `/api/users/${hashCache.username}/lists/${listId}`,
              method: 'GET',
              params: testParams,
            });
            hashCache.resources.listContents[listId] = data;
            hashCache.hashes.listContents[listId] = (
              await hashCache.config.hashFunc(JSON.stringify(data))
            );
          }
          return {} as Record<string, ListItem[]>
        },
        POST: async (hashCache, _, record: { listnameId: number }) => {
          const listId = record.listnameId;
          const newRecord = await easyFetch<ListItem>({
            route: `/api/users/${hashCache.username}/lists/${record.listnameId}`,
            method: 'POST',
            params: testParams,
            body: record,
          });
          hashCache.resources.listContents[listId].push(newRecord);
          hashCache.hashes.listContents[listId] = (
            await hashCache.config.hashFunc(
              `${JSON.stringify(hashCache.hashes.listContents[listId])},POST,${newRecord}`
            )
          );
          return {} as ListItem
        }
      },
    },
  },
  hashFunc: hash
} as const satisfies Config

type Config = {
  resources: {
    [resourceName: string]: {
      key?: string,
      compare: (client: any, server: any) => any,
      fetch: {
        [M in Methods]?: (
          hashCache: ClientHashCacheV4,
          serverHashes: any,
          ...args: any[]
        ) => Promise<any>
      }
    }
  },
  hashFunc: (data: string) => Promise<string>
}

// type ConfigV2 = {
//   resources: ConfigResources,
//   hashFunc: (data: string) => Promise<string>
// }
// 
// type ConfigResources = {
//   [R in Resources]: R extends NestedResources
//     ? { key: string, fetch: FetchType }
//     : { fetch: FetchType }
// }
// 
// type FetchType = {
//   [M in Methods]?: (
//     hashCache: ClientHashCacheV4,
//     serverHashes: any,
//     ...args: any[]
//   ) => Promise<any>
// }

// type ConfigGeneric<R extends Record<string, any>> = {
//   resources: R,
//   hashFunc: (data: string) => Promise<string>,
// }
// type TypeConfig = ConfigGeneric<typeof configV2['resources']>

function defineNestedResources<const T extends Resources[]>(arr: T) {
  if (new Set(arr).size !== arr.length) {
    throw Error('duplicate detected in nested resources');
  }
  return arr;
}

function includes<T extends readonly string[]>(arr: T, val: string): val is T[number] {
  return arr.includes(val);
}

// function isNestedResource(resource: Resources): resource is NestedResources {
//   return includes(nestedResources, resource);
// }

type Resources = keyof typeof configV2['resources']
// const nestedResources = [ 'listContents' ] as const
const nestedResources = defineNestedResources([ 'listContents' ]);
type NestedResources = typeof nestedResources[number]
type HashesV2 = {
  [R in Resources]: R extends NestedResources ? { [key: string]: string } : string
}
type UserDataV2 = {
  [R in Resources]: GetReturnType<R, 'GET'>
}
// Make sure ServerHashCache.getHashes returns ServerResponse
// Make sure the hash type for ServerHashCache and ClientHashCache is also HashV2
type ServerResponse = HashesV2 | null
// type ServerResponse = HashesFromConfig<Config> | null

// These might be worth coming back to
// type HashesFromConfig<C extends Config> = {
//   [R in keyof C['resources']]: R extends NestedResources ? { [key: string]: string } : string
// }

// type UserDataFromConfig<C extends Config> = {
//   [R in keyof C['resources']]: C['resources'][R]['fetch']['GET'] extends (...args: any[]) => Promise<infer Return>
//     ? Return : never
// }

// const test: ServerHashes = {
//   listnames: 'asdf',
//   listContents: { key: 'val' }
// }

// type FillWith<T extends Partial<Record<Methods, any>>, F> = {
//   [K in Methods]: K extends keyof T ? T[K] : F
// }
// 
// type ReqTypes<K extends Resources, M extends Methods> = {
//   listnames: FillWith<{}, undefined>,
//   listContents: FillWith<{}, undefined>,
// }[K][M]
// type Keys = (string | number)[]
type GetRecordType<
  R extends Resources,
  M extends ExistingMethod<R>
> = Parameters<
  Extract<typeof configV2['resources'][R]['fetch'][M],
  (...args: any) => any>
>[2]
type GetReturnType<
  R extends Resources,
  M extends ExistingMethod<R>
> = Awaited<
  ReturnType<
    Extract<typeof configV2['resources'][R]['fetch'][M],
    (...args: any) => any>
  >
>
type ExistingMethod<R extends Resources> = keyof typeof configV2['resources'][R]['fetch']
type TrustMe = any

// type ResourceModFunc<
//   R extends Resources,
//   M extends ExistingMethod<R>
// > = (
//   oldData: GetReturnType<R, 'GET'>,
//   newData: GetReturnType<R, M>
// ) => GetReturnType<R, 'GET'>

// const resourceModFuncs: { [M in Methods]: ResourceModFunc<R, M> } = {}

function getKey(resource: NestedResources, data: any) {
  const keyName = configV2.resources[resource].key;
  if (!keyName) throw Error(`Cannot find keyName for ${resource}`);
  const key = Array.isArray(data) ? data[0][keyName] : data[keyName];
  if (!key) throw Error(`Cannot find key for ${resource}`);
  return key;
}

// share this function between clientHashCache and serverHashCache
// this will help ensure hashes are updated with the exact same logic
async function updateHash(
  hashes: HashesV2,
  resource: Resources,
  method: ExistingMethod<typeof resource>,
  data: GetReturnType<typeof resource, typeof method>
) {
  if (method === 'GET') {
    if (includes(nestedResources, resource)) {
      const key = getKey(resource, data);
      hashes[resource][key] = await configV2.hashFunc(
        JSON.stringify(data)
      );
    } else {
      hashes[resource] = await configV2.hashFunc(
        JSON.stringify(data)
      )
    }
  } else {
    if (includes(nestedResources, resource)) {
      const key = getKey(resource, data);
      if (!hashes[resource][key]) {
        throw Error(`No hash to update for hashes.${resource}.${key}`);
      }
      hashes[resource][key] = await configV2.hashFunc(
        `${hashes[resource][key]},${method.toString()},${JSON.stringify(data)}`
      );
    } else {
      if (!hashes[resource]) {
        throw Error(`No hash to update for hashes.${resource}`);
      }
      hashes[resource] = await configV2.hashFunc(
        `${hashes[resource]},${method.toString()},${JSON.stringify(data)}`
      );
    }
  }
}

export class ClientHashCacheV4 {
  config: Config;
  username: string;
  // resources: { [R: keyof Config['resources']]: any };
  // hashes: { [R: keyof Config['resources']]: any };
  resources: UserDataV2;
  hashes: HashesV2;
  isSynced: boolean;
  modFuncs = {
    GET: (_: any[], newData: any[]) => newData,
    POST: (oldData: any[], newData: any) => oldData.concat(newData),
    PUT: (oldData: any[], newData: any, match: string[]) => {
      return oldData.map(obj => {
        if (match.every(key => obj[key] === newData[key])) {
          return newData;
        }
        return obj
      })
    },
    DELETE: (oldData: any[], newData: any, match: string[]) => {
      return oldData.filter(obj => {
        return match.every(key => obj[key] !== newData[key])
      })
    }
  }

  constructor(config: Config, username: string) {
    this.config = config;
    this.username = username;
    this.resources = {} as UserDataV2;
    this.hashes = {} as HashesV2;
    this.isSynced = false;
    this.sync();
  }

  async sync(retryCount = 0, maxRetryCount = 5) {
    console.log(`SYNCING, ${retryCount}/${maxRetryCount}`)
    if (retryCount >= maxRetryCount) {
      throw Error('Failed to sync')
    }
    this.isSynced = true;
    const serverHashes = await easyFetch<ServerResponse>({
      route: '/api/sync',
      method: 'GET',
    });
    console.log({
      serverHashes,
      clientHashes: this.hashes,
    })

    // Ideally this should be something like
    // ConfigV2 will need updated
    //  - add compare functions for each resource
    //  - fix fetch methods to return fetched data instead of directly modifying resource and hashes
    // for each resource {
    //   const compareResult = this.config.resource.compare(clientHash, serverHash)
    //   if (compareResult) {
    //     const newResource = updateResource(compareResult)
    //     this.updateResource(resource, 'GET', newResource)
    //   }
    // }
    for (const resource in this.config.resources) {
      console.log('getting resource', resource)
      await this.getFetchFunc(resource as Resources, 'GET')(this, serverHashes);
    }
    if (!this.isSynced) {
      this.sync(retryCount + 1);
    }
    console.log('IS SYNCED')
  }

  getFetchFunc<R extends Resources, M extends ExistingMethod<R>>(
    resource: R,
    method: M,
  ) {
    const fetchFunc = this.config.resources[resource].fetch[method] as TrustMe;
    if (!fetchFunc) throw Error(`Cannot find ${method.toString()} func for ${resource}`);
    return fetchFunc;
  }

  getModFunc<M extends Methods>(method: M) {
    const modFunc = (this.modFuncs as any)[method];
    if (!modFunc) throw Error(`Cannot find modFunc for ${method.toString()}`);
    return modFunc;
  }

  // async updateResource<R extends Resources, M extends ExistingMethod<R>>(
  //   resource: R,
  //   method: M,
  //   data: GetRecordType<R, M>
  // ) {
  //   const fetchFunc = this.getFetchFunc(resource, method);
  //   await fetchFunc(this, data);
  //   // await this.getFetchFunc(resource, method)(this, data)
  // }

  async updateResource<R extends Resources, M extends ExistingMethod<R>>(
    resource: R,
    method: M,
    data: GetRecordType<R, M>
    // The below types do not expose the types we want
    // resource: Resources,
    // method: ExistingMethod<typeof resource>,
    // data: GetReturnType<typeof resource, typeof method>
  ) {
    const newResource = await this.getFetchFunc(resource, method)(this, data);
    const modFunc = this.getModFunc(method as any);
    if (includes(nestedResources, resource)) {
      const key = getKey(resource, newResource);
      (this.resources[resource] as any)[key] = modFunc(
        this.resources[resource][key], newResource
      );
    } else {
      this.resources[resource] = modFunc(this.resources[resource], newResource);
    }
    this.updateHash(resource, method as any, data);
  }

  async updateHash<R extends Resources, M extends ExistingMethod<R>>(
    // resource: R,
    // method: M,
    // data: GetRecordType<R, M>
    // The below types do not expose the types we want
    // But that does that really matter for this function since it should only be called internally?
    resource: Resources,
    method: ExistingMethod<typeof resource>,
    data: GetReturnType<typeof resource, typeof method>
  ) {
    const userHashes = this.hashes;
    if (method === 'GET') {
      if (includes(nestedResources, resource)) {
        const key = getKey(resource, data);
        userHashes[resource][key] = await this.config.hashFunc(
          JSON.stringify(data)
        );
      } else {
        userHashes[resource] = await this.config.hashFunc(
          JSON.stringify(data)
        )
      }
    } else {
      if (includes(nestedResources, resource)) {
        const key = getKey(resource, data);
        userHashes[resource][key] = await this.config.hashFunc(
          `${userHashes[resource][key]},${method.toString()},${JSON.stringify(data)}`
        );
      } else {
        userHashes[resource] = await this.config.hashFunc(
          `${userHashes[resource]},${method.toString()},${JSON.stringify(data)}`
        );
      }
    }
  }
}
// const clientHashCache = new ClientHashCacheV4(configV2, 'tedifer_jones')
// clientHashCache.updateResource('listnames', 'POST', { listname: 'asdf' })

export class ServerHashCacheV4 {
  config: Config;
  cache: { [username: string]: HashesV2 | undefined };
  // cache: { [username: string]: HashesFromConfig<Config> | undefined };

  constructor(config: Config) {
    this.cache = {};
    this.config = config;
  }

  getHashes(username: string): ServerResponse {
    return this.cache[username] || null
  }

  async updateHash(
    username: string,
    resource: Resources,
    method: ExistingMethod<typeof resource>,
    data: GetReturnType<typeof resource, typeof method>
  ) {
    if (!this.cache[username]) this.cache[username] = {} as HashesV2
    const userHashes = this.cache[username]!
    if (method === 'GET') {
      if (includes(nestedResources, resource)) {
        const key = getKey(resource, data);
        userHashes[resource][key] = await this.config.hashFunc(
          JSON.stringify(data)
        );
      } else {
        userHashes[resource] = await this.config.hashFunc(
          JSON.stringify(data)
        )
      }
    } else {
      if (includes(nestedResources, resource)) {
        const key = getKey(resource, data);
        userHashes[resource][key] = await this.config.hashFunc(
          `${userHashes[resource][key]},${method},${JSON.stringify(data)}`
        );
      } else {
        userHashes[resource] = await this.config.hashFunc(
          `${userHashes[resource]},${method},${JSON.stringify(data)}`
        );
      }
    }
  }

  // async updateHash(username: string, resource: string, method: Methods, data: any) {
  //   if (!this.cache[username]) this.cache[username] = {};
  //   const userHashes = this.cache[username]!
  //   if (method === 'GET') {
  //     userHashes[resource] = await this.config.hashFunc(JSON.stringify(data));
  //   } else {
  //     if (!userHashes[resource]) throw Error('no resource to update');
  //     userHashes[resource] = await this.config.hashFunc(
  //       `${JSON.stringify(userHashes[resource])},${method},${JSON.stringify(data)}`
  //     );
  //   }
  // }

  // async updateHash(username: string, keys: (string | number)[], method: Methods, data: any) {
  //   if (!this.cache[username]) this.cache[username] = {} as HashesV2;
  //   const userHashes = this.cache[username]!
  //   if (method === 'GET') {
  //     this.setVal(userHashes, keys, 
  //       await this.config.hashFunc(JSON.stringify(data))
  //     )
  //   } else {
  //     this.setVal(userHashes, keys, 
  //       await this.config.hashFunc(
  //         `${this.getVal(userHashes, keys)},${method},${data}`
  //       )
  //     )
  //   }
  // }

  // setVal(hashObj: any, keys: (string | number)[], val: string): void {
  //   if (!hashObj[keys[0]]) hashObj[keys[0]] = {};
  //   if (keys.length === 1) {
  //     hashObj[keys[0]] = val;
  //     return;
  //   }
  //   return this.setVal(hashObj[keys[0]], keys.slice(1), val);
  // }

  // getVal(obj: any, keys: (string | number)[]): any {
  //   if (keys.length === 0) return obj;
  //   return this.getVal(obj[keys[0]], keys.slice(1))
  // }

  // getParent(hashObj: Object, keys: string[]) {
  //   if (keys.length === 1) return 
  // }
}

export const serverHashCache = new ServerHashCacheV4(configV2);
// serverHashCache.updateHash('tedifer_jones', 'listnames', 'GET', undefined)
if (!(globalThis as any).serverHashCache) {
  (globalThis as any).serverHashCache = serverHashCache;
}
