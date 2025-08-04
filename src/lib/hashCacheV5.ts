import { ReviewBody } from '@/components/pages/mediaPage/reviewManager';
import { listnames, lists, reviews, watched } from '@/drizzle/schema';
import easyFetch, { Methods } from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';
import { Dispatch, SetStateAction } from 'react';

type EasyFetchData = Omit<
  Parameters<typeof easyFetch>[0],
  'route' | 'method' | 'retryCount'
>
type DataCache<T> = { [key: string]: T | DataCache<T> }
type ServerResource = {
  hash: string,
  url: string,
  dependent: Dependent
  isResource: true,
}
type ServerResponse = DataCache<ServerResource> | null
type Dependent = { name: string, key: string }
type Matcher = string[] 
type Config = {
  [key: string]: {
    match: Matcher,
    dependent?: Dependent,
    url: (client: ClientHashCacheV5, ...args: any[]) => string,
  }
}
type SerializedResource = {
  data: any;
  hash: string;
  url: string;
  dependent?: Dependent;
  isResource: true;
}
type SerializedCache = DataCache<SerializedResource> 
type ResourceArgs = {
  url: string,
  dependent?: Dependent,
  data?: any,
  hash?: string,
  match?: Matcher,
}
export type UserContext = { current: ClientHashCacheV5 | null }
type SetUserContext = Dispatch<SetStateAction<UserContext>>
export type SyncOpts = 'notSynced' | 'syncing' | 'synced' | ''

type Listname = typeof listnames.$inferSelect;
// type ListItem = typeof lists.$inferSelect;
// type ListItem = (ExistingMediaInfo & { listData: number })[]
// export type ListItem = (typeof lists.$inferSelect) & { mediaInfo: ExistingMediaInfo };
export type ListItem = (ExistingMediaInfo & { dateAdded: number })
type WatchedRec = typeof watched.$inferSelect & { title: string }
type Review = typeof reviews.$inferSelect & { title: string }

const testParams = { testType: 'userContext' }

async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const dataHandlers: { [M in Methods]?: (extData: any, newData: any, match?: Matcher) => any } = {
  GET: (_, newData) => newData,
  POST: (extData, newData) => extData.concat(newData),
  PUT: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.map((data: any) => {
      if (match.every(key => data[key] === newData[key])) {
        return newData
      }
      return data
    })
  },
  DELETE: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.filter((data: any) => {
      return !match.every(key => data[key] === newData[key]);
    });
  },
  PATCH: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.map((data: any) => {
      if (match.every(key => data[key] === newData[key])) {
        return newData
      }
      return data
    })
  }
}

function isResource<T extends { isResource: true }>(
  value: T | DataCache<T>
): value is T {
  return value.isResource === true;
}

function reverseDependencies(config: Config) {
  const dependents = new Set<string>();
  const revDeps = Object.keys(config).reduce((obj, key) => {
    if (config[key].dependent) {
      dependents.add(key);
      const dep = config[key].dependent!;
      obj[dep.name] = { name: key, key: dep.key };
    }
    return obj;
  }, {} as { [key: string]: Dependent });
  return { dependents, revDeps }
}

class Resource<T = any> {
  data: T;
  hash: string;
  url: string;
  dependent?: Dependent;
  isResource = true;
  lookupObj = {} as { [key: string]: { [key: string]: T } };
  match?: Matcher;

  constructor({ url, dependent, hash, data, match }: ResourceArgs) {
    this.url = url;
    this.dependent = dependent;
    this.hash = hash || '';
    this.data = data;
    this.match = match;
  }

  async update(cache: ClientHashCacheV5, method: Methods, data?: EasyFetchData) {
    cache.isSynced = false;
    cache.setSyncState('notSynced');
    const { params, body } = data || {};
    const result = await easyFetch({
      route: this.url,
      method,
      params: { ...testParams, ...params, useHashCache: true },
      body: body,
    });

    // console.log(this.url, 'make dependents')
    // if (!(cache.cache as any) && this.dependent) {
    //   if (!cache.cache[this.dependent.name]) cache.cache[this.dependent.name] = {};
    //   (result as any[]).forEach(data => {
    //     if (!this.dependent) throw Error('no dependent found');
    //     const key = data[this.dependent.key];
    //     if (!key) throw Error(`key ${this.dependent.key} not found`);
    //     const match = cache.config[this.dependent.name].match;
    //     console.log('creating nested', this.dependent.name);
    //     (cache.cache[this.dependent.name] as any)[key] = new Resource({
    //       url: `${this.url}/${key}`,
    //       match
    //     });
    //   })
    // }

    if (this.dependent) {
      if (method === 'POST') {
        console.log('pre key setting', result, this.dependent.key)
        const key = (result as any)[this.dependent.key];
        console.log('key is', key)
        console.log('add dependent', this.dependent)
        const match = cache.config[this.dependent.name].match;
        (cache.cache[this.dependent.name] as any)[key] = new Resource({
          url: `${this.url}/${key}`,
          match
        });
      } else if (method === 'DELETE') {
        console.log('pre key setting', result, this.dependent.key)
        const key = (result as any)[this.dependent.key];
        console.log('key is', key)
        console.log('delete dependent', this.dependent)
        console.log('deleting', this.dependent.name, key)
        delete (cache.cache[this.dependent.name] as any)[key]
      }
    }

    const modFunc = dataHandlers[method];
    if (!modFunc) throw Error(`No modFunc found for ${method}`);
    this.data = modFunc(this.data, result, this.match);
    if (method === 'GET') {
      this.hash = await hash(JSON.stringify(this.data));
    } else {
      this.hash = await hash(`${this.hash},${method},${JSON.stringify(result)}`);
    }
    // console.log('SET NEW DATA', this.data)
    if (!cache.deferSync) {
      cache.save();
    }
  }

  lookup(key: string, val: string) {
    if (!this.lookupObj[key]) {
      if (!Array.isArray(this.data)) throw Error('data is not an array');
      // [ { imdbId: 1 }, { imdbId: 2 } ]
      console.log(this.data)
      this.lookupObj[key] = this.data.reduce((lookup, val) => {
        console.log(val)
        if (!val[key]) throw Error('key cannot be found')
        lookup[val[key]] = val
        return lookup
      }, {} as { [key: string]: T });
    }
    return this.lookupObj[key][val];
  }

  buildDependencies(cache: ClientHashCacheV5) {
    if (!this.dependent) throw Error('no dependent found')
    if (!cache.cache[this.dependent.name]) cache.cache[this.dependent.name] = {};
    (this.data as any[]).forEach(data => {
      if (!this.dependent) throw Error('no dependent found');
      const key = data[this.dependent.key];
      if (!key) throw Error(`key ${this.dependent.key} not found`);
      const match = cache.config[this.dependent.name].match;
      console.log('creating nested', this.dependent.name);
      (cache.cache[this.dependent.name] as any)[key] = new Resource({
        url: `${this.url}/${key}`,
        match
      });
    })
  }
}

export class ClientHashCacheV5 {
  cache: DataCache<Resource>;
  username: string;
  isSynced = true;
  setState: SetUserContext;
  config: Config;
  deferSync = false;
  setSyncState: Dispatch<SetStateAction<SyncOpts>>;

  constructor(
    username: string,
    config: Config,
    setState: SetUserContext,
    setSyncState: Dispatch<SetStateAction<SyncOpts>>
  ) {
    this.username = username;
    this.setState = setState;
    this.config = config;

    this.setSyncState = setSyncState;
    this.setSyncState('syncing');

    // load state from localStorage, if no state, build from config
    this.cache = this.load() || this.init(config);
    this.sync();
  }

  // setSyncStatus(state: SyncOpts) {
  //   this.isSynced = state;
  //   this.setSyncState(state);
  // }

  init(config: Config): DataCache<Resource> {
    // const isDependent = new Set<string>();
    // const revDependencies = Object.keys(config).reduce((obj, key) => {
    //   if (config[key].dependent) {
    //     isDependent.add(key);
    //     const dep = config[key].dependent!;
    //     obj[dep.name] = { name: key, key: dep.key };
    //   }
    //   return obj;
    // }, {} as { [key: string]: Dependent });
    const { revDeps, dependents } = reverseDependencies(config);

    return Object.keys(config).reduce((cache, key) => {
      if (dependents.has(key)) {
        cache[key] = {};
      } else {
        const url = config[key].url(this);
        cache[key] = new Resource({
          url,
          dependent: revDeps[key],
          match: config[key].match
        });
      }
      return cache;
    }, {} as DataCache<Resource>);
  }

  async sync(retryCount = 0, maxRetryCount = 5) {
    console.log(`V5 sync ${retryCount}/${maxRetryCount}`)
    if (retryCount >= maxRetryCount) {
      throw Error('failed to sync, max retry count reached');
    }
    this.isSynced = true;
    const serverHashes = await easyFetch<ServerResponse>({
      route: '/api/sync',
      method: 'GET',
      params: { v: 5 },
    });
    console.log({ serverHashes, client: this })

    this.deferSync = true;
    if (!serverHashes) {
      await this.getAll();
    } else {
      // we need to address cases where server has more or less keys than client
      // this is especially needed for listContents resource
      // if a list is added on device A, listnames will get synced to device B but listContents[newListId] will not
      // if we include URL server side, it will be much easier to update keys that do not yet exist on the client
      // if a key exists on the client but not on the server, just delete it
      // try {
      //   await this.compare(serverHashes);
      // } catch {
      //   // this isn't a real solution and it defeats the purpose of the hashCache
      //   // we want to fetch each individual resource if doesn't match
      //   console.log('failed to compare, fetching all')
      //   this.cache = this.init(this.config);
      //   await this.getAll();
      // }
      console.log('COMPARING')
      await this.compare(serverHashes)
    }
    this.deferSync = false;

    if (!this.isSynced) {
      console.log('ATTEMPT RESYNC', retryCount + 1, this)
      await this.sync(retryCount + 1);
      return;
    }

    // console.log('SYNCED V5')
    this.save();
    this.setSyncState('synced');
    setTimeout(() => this.setSyncState(''), 1500);
  }

  async getAll(cache = this.cache) {
    for (const key of Object.keys(cache)) {
      console.log('GET ALL', key)
      if (cache[key].isResource) {
        const resource = cache[key] as Resource;
        await resource.update(this, 'GET');
        if (resource.dependent) {
          resource.buildDependencies(this);
        }
      } else {
        console.log('descending into', key, cache[key])
        await this.getAll(cache[key] as DataCache<Resource>);
      }
    }
  }

  async compare(server: DataCache<ServerResource>, client = this.cache) {
    const uniqueKeys = [
      ...new Set(Object.keys(server).concat(Object.keys(client)))
    ];

    const { needsSynced, needsAdded, needsDeleted } = (
      uniqueKeys.reduce((obj, key) => {
        if (client[key] && server[key]) {
          obj.needsSynced.push(key);
        } else if (client[key]) {
          obj.needsDeleted.push(key);
        } else if (server[key]) {
          obj.needsAdded.push(key);
        } else {
          throw Error('This should be impossible');
        }
        return obj
      }, {
          needsSynced: [] as string[],
          needsAdded: [] as string[],
          needsDeleted: [] as string[],
        })
    )

    // console.log({ needsDeleted, needsAdded, needsSynced })
    if (needsDeleted.length) {
      console.log({ server, client })
      throw Error(`want to delete: ${needsDeleted.join(', ')}`)
    }
    needsDeleted.forEach(key => delete client[key]);
    await Promise.all(
      needsAdded.map(async key => {
        console.log('server has new resource, adding and syncing')
        const url = server[key].url;
        console.log(server, key, url)
        if (typeof url !== 'string') throw Error('Url is not a string');
        const resource = new Resource({ url });
        client[key] = resource;
        await resource.update(this, 'GET');
      })
    );

    await Promise.all(
      needsSynced.map(async key => {
        if (client[key].isResource) {
          if (client[key].hash !== server[key].hash) {
            console.log('SYNCING', key)
            await (client[key] as Resource).update(this, 'GET');
          }
        } else {
          await this.compare(
            server[key] as DataCache<ServerResource>,
            client[key] as DataCache<Resource>,
          );
        }
      })
    );

    // await Promise.all(
    //   Object.keys(server).map(async key => {
    //     if (!client[key]) throw Error('no client key')
    //     if (client[key].isResource) {
    //       if (server[key].hash !== client[key].hash) {
    //         await (client[key] as Resource).update(this, 'GET');
    //       }
    //     } else {
    //       await this.compare(
    //         server[key] as DataCache<ServerResource>,
    //         client[key] as DataCache<Resource>
    //       );
    //     }
    //   })
    // );
  }

  save() {
    console.log('SAVING')
    const allState = JSON.parse(
      localStorage.getItem(storageKey) || JSON.stringify({})
    );
    allState[this.username] = JSON.stringify(this.cache);
    localStorage.setItem(storageKey, JSON.stringify(allState));
    // this.setState({ current: null });
    this.setState({ current: this });
  }

  load() {
    const allState = JSON.parse(
      localStorage.getItem(storageKey) || JSON.stringify({})
    );
    const userState: SerializedCache | undefined = (
      allState[this.username] && JSON.parse(allState[this.username])
    );
    if (userState) {
      console.log('LOADED')
      return this.deserialize(userState);
    }
  }

  deserialize(userState: SerializedCache) {
    return Object.keys(userState).reduce((resources, key) => {
      if (userState[key].isResource) {
        const serialized = userState[key] as SerializedResource;
        resources[key] = new Resource(serialized);
      } else {
        resources[key] = this.deserialize(userState[key] as SerializedCache);
      }
      return resources;
    }, {} as DataCache<Resource>);
  }

  async update<R extends Resources, M extends Methods>(
    data: ClientTypes<R, M>,
    method: M,
    resource: R,
    ...keys: (string | number)[]
  ) {
    const res: Resource = keys.reduce((obj, key) => {
      console.log(obj, key)
      if (!obj[key]) throw Error(`Key ${key} does not exist`);
      return (obj as any)[key];
    }, this.cache[resource] as any);
    if (!res.isResource) throw Error('not a resource');
    await res.update(this, method, data);
    // await this.sync();
    if (!this.deferSync) {
      await this.sync();
    } else {
      console.log('DEFERING SYNC')
    }
  }

  getResource<R extends Resources>(resource: R, ...keys: (string | number)[]) {
    // this should return the resource's .data attribute, not the whole resource
    // unless there is a reason to access other attributes client side
    // but so far there is no need
    // return keys.reduce((data, key) => {
    //   if (!data[key]) throw Error(`Key: ${key} does not exist`);
    //   return data[key]
    // }, this.cache[resource] as { [key: string]: any }) as Resource<ServerTypes<R, 'GET'>>
    const res = keys.reduce((data, key) => {
      if (!data[key]) throw Error(`Key: ${key} does not exist`);
      return data[key]
    }, this.cache[resource] as { [key: string]: any }) as Resource<ServerTypes<R, 'GET'>>
    return res.data;
  }
}

export class ServerHashCacheV5 {
  cache: { [username: string]: DataCache<ServerResource> | undefined }
  // config: Config
  reverseDependencies: ReturnType<typeof reverseDependencies>

  constructor(config: Config) {
    this.cache = {}
    // this.config = config;
    this.reverseDependencies = reverseDependencies(config);
  }

  getHashes(username: string): ServerResponse {
    return this.cache[username] || null;
  }

  async update<R extends Resources, M extends Methods>(
    req: Request,
    username: string,
    data: ServerTypes<R, M>,
    method: M,
    resource: R,
    ...keys: (string | number)[]
  ) {
    // console.log('STARTED SETTING', username, resource, keys)
    if (!this.cache[username]) this.cache[username] = {};
    const userHashes = this.cache[username]!;
    if (!userHashes[resource]) userHashes[resource] = {};
    const res: (DataCache<ServerResource> | ServerResource) = (
      keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {}
        return (obj as any)[key];
      }, userHashes[resource] as any)
    );
    // this needs to be cleaned up
    // if res does not exist create a new one and fill with url and dependent
    // otherwise just update the hash

    console.log('SETTING', res, resource, keys)
    if (isResource<ServerResource>(res)) {
      // RESOURCE ALREADY EXISTS
      if (method === 'GET') {
        res.hash = await hash(JSON.stringify(data));
      } else {
        res.hash = await hash(`${res.hash},${method},${JSON.stringify(data)}`);
        if (res.dependent) {
          const key = (data as any)[res.dependent.key]
          if (method === 'POST') {
            console.log('adding dependent')
            if (!userHashes[res.dependent.name]) {
              userHashes[res.dependent.name] = {};
            }
            (userHashes[res.dependent.name] as any)[key] = {
              isResource: true,
              url: `${res.url}/${key}`,
              hash: '',
            }
          } else if (method === 'DELETE') {
            console.log('deleting dependent')
            delete (userHashes[res.dependent.name] as any)[key]
          }
        }
      }
      // console.log(userHashes)
    } else {
      // MAKE RESOURCE
      if (method !== 'GET') {
        throw Error('new resources must be created with GET method');
      }
      (res as any).isResource = true;
      (res as any).url = new URL(req.url).pathname;
      (res as any).dependent = this.reverseDependencies.revDeps[resource];
      (res as any).hash = await hash(JSON.stringify(data));
    }
    // console.log('SET', userHashes)

    // if (method === 'GET') {
    //   // console.log('SETTING', resource, keys)
    //   res.hash = await hash(JSON.stringify(data));
    //   res.url = new URL(req.url).pathname;
    //   // console.log(userHashes)
    // } else {
    //   res.hash = await hash(`${res.hash},${method},${JSON.stringify(data)}`);
    // }
    // console.log('FINISHED SETTING', username, resource, keys)
  }
}

const storageKey = 'media-tracker';
export const configV5 = {
  listnames: {
    match: [ 'id' ],
    url: (client) => `/api/users/${client.username}/lists`,
  },
  listContents: {
    match: [ 'imdbId' ],
    dependent: { name: 'listnames', key: 'id' },
    url: (client, listId: number) => `/api/users/${client.username}/lists/${listId}`,
  },
  watched: {
    match: [ 'id' ],
    url: (client) => `/api/users/${client.username}/watched`,
  },
  reviews: {
    match: [ 'imdbId' ],
    url: (client) => `/api/users/${client.username}/reviews`,
  }
} as const satisfies Config

// export const serverHashCacheV5 = new ServerHashCacheV5(configV5);
// if (!(globalThis as any).serverHashCacheV5) {
//   (globalThis as any).serverHashCacheV5 = serverHashCacheV5;
// }

// copy this pattern over to regular server cache if it proves to work correctly
declare global {
  var serverHashCacheGlobal: ServerHashCacheV5 | undefined;
}
export const serverHashCacheV5 = (
  globalThis.serverHashCacheGlobal || new ServerHashCacheV5(configV5)
);
if (!globalThis.serverHashCacheGlobal) {
  console.log('SETTING HASH CACHE')
  globalThis.serverHashCacheGlobal = serverHashCacheV5;
}

type FillWith<T extends Partial<Record<Methods, any>>, F> = {
  [K in Methods]: K extends keyof T ? T[K] : F
}
type Resources = keyof typeof configV5;
type ClientTypes<R extends Resources, M extends Methods> = {
  listnames: FillWith<{
    POST: { params: { listname: string } },
    PUT: { params: { listname: string, newListname: string, id: number } },
    DELETE: { params: { id: number } },
    PATCH: { params: { listname: string, set: string, val: boolean } },
  }, undefined>,
  listContents: FillWith<{
    POST: {
      params: { listname: string, listId: number, imdbId: string },
    },
    DELETE: {
      params: { listname: string, listId: number, imdbId: string },
    },
    PATCH: { params: { imdbId: string } },
  }, undefined>,
  watched: FillWith<{
    POST: { params: { imdbId: string } },
    DELETE: { params: { id: number } },
  }, undefined>,
  reviews: FillWith<{
    POST: {
      params: { imdbId: string },
      body: ReviewBody,
    },
    PUT: {
      params: { imdbId: string },
      body: ReviewBody,
    },
    DELETE: { params: { imdbId: string } },
  }, undefined>,
}[R][M]
type ServerTypes<R extends Resources, M extends Methods> = {
  listnames: FillWith<{
    GET: Listname[],
    POST: Listname,
    PUT: Listname,
    DELETE: { id: number }
    PATCH: Listname,
  }, undefined>,
  listContents: FillWith<{
    // GET: ListItem[],
    // GET: ExistingMediaInfo[],
    GET: ListItem[],
    PATCH: ListItem,
    DELETE: { imdbId: string },
  }, undefined>,
  watched: FillWith<{
    GET: WatchedRec[],
    POST: WatchedRec,
    DELETE: { id: number }
  }, undefined>,
  reviews: FillWith<{
    GET: Review[],
    POST: Review,
    PUT: Review,
    DELETE: { imdbId: string },
  }, undefined>,
}[R][M]
// type Config = typeof config;

// TESTING
// const client = new ClientHashCacheV5('me', configV5);
// console.log(client)
// client.update({ listId: 1, listname: 'listname', imdbId: 'imdbId' }, 'POST', 'listnames')
