import { listnames, lists } from '@/drizzle/schema';
import easyFetch, { Methods } from '@/lib/easyFetch';
import { Dispatch, SetStateAction } from 'react';

type EasyFetchData = Omit<
  Parameters<typeof easyFetch>[0],
  'route' | 'method' | 'retryCount'
>
type DataCache<T> = { [key: string]: T | DataCache<T> }
type ServerResource = { hash: string, url: string }
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

type Listname = typeof listnames.$inferSelect;
type ListItem = typeof lists.$inferSelect;

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
  DELETE: (extData, newData, match) => {
    if (!match) throw Error('no matcher found');
    return extData.filter((data: any) => {
      return !match.every(key => data[key] === newData[key]);
    });
  }
}

class Resource<T = any> {
  data: T;
  hash: string;
  url: string;
  dependent?: Dependent;
  isResource = true;
  lookupObj = {} as { [key: string]: { [key: string]: T } };
  match?: Matcher 

  constructor({ url, dependent, hash, data, match }: ResourceArgs) {
    this.url = url;
    this.dependent = dependent;
    this.hash = hash || '';
    this.data = data;
    this.match = match;
  }

  async update(cache: ClientHashCacheV5, method: Methods, data?: EasyFetchData) {
    cache.isSynced = false;
    const { params, body } = data || {};
    const result = await easyFetch({
      route: this.url,
      method,
      params: { ...testParams, ...params },
      body: body,
    });

    if (this.dependent) {
      if (!cache.cache[this.dependent.name]) cache.cache[this.dependent.name] = {};
      (result as any[]).forEach(data => {
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

    const modFunc = dataHandlers[method];
    if (!modFunc) throw Error(`No modFunc found for ${method}`);
    this.data = modFunc(this.data, result, this.match);
    if (method === 'GET') {
      this.hash = await hash(JSON.stringify(this.data));
    } else {
      this.hash = await hash(`${this.hash},${method},${result}`);
    }
    // console.log('SET NEW DATA', this.data)
    // cache.save();
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
}

export class ClientHashCacheV5 {
  cache: DataCache<Resource>;
  username: string;
  isSynced = true;
  setState: SetUserContext;
  config: Config;
  deferSync = false;

  constructor(username: string, config: Config, setState: SetUserContext) {
    this.username = username;
    this.setState = setState;
    this.config = config;
    // load state from localStorage, if no state, build from config
    this.cache = this.load() || this.init(config);
    this.sync();
  }

  init(config: Config): DataCache<Resource> {
    const isDependent = new Set<string>();
    const revDependencies = Object.keys(config).reduce((obj, key) => {
      if (config[key].dependent) {
        isDependent.add(key);
        const dep = config[key].dependent!;
        obj[dep.name] = { name: key, key: dep.key };
      }
      return obj;
    }, {} as { [key: string]: Dependent });

    return Object.keys(config).reduce((cache, key) => {
      if (isDependent.has(key)) {
        cache[key] = {};
      } else {
        const url = config[key].url(this);
        cache[key] = new Resource({
          url,
          dependent: revDependencies[key],
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

    if (!serverHashes) {
      this.deferSync = true;
      await this.getAll();
      this.deferSync = false;
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
      await this.compare(serverHashes)
    }

    if (!this.isSynced) {
      await this.sync(retryCount + 1);
      return;
    }

    console.log('SYNCED V5')
    this.save();
  }

  async getAll(cache = this.cache) {
    for (const key of Object.keys(cache)) {
      if (cache[key].isResource) {
        const resource = cache[key] as Resource;
        await resource.update(this, 'GET');
      } else {
        console.log('descending into', key)
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

    console.log({ needsDeleted, needsAdded, needsSynced })
    if (needsDeleted.length) {
      console.log({ server, client })
      throw Error('want to delete something')
    }
    needsDeleted.forEach(key => delete client[key])
    needsAdded.forEach(key => {
      console.log('server has new resource, adding and syncing')
      const url = server[key].url;
      if (typeof url !== 'string') throw Error('Url is not a string');
      client[key] = new Resource({ url });
    });

    await Promise.all(
      needsSynced.map(async key => {
        if (client[key].isResource) {
          if (client[key].hash !== server[key].hash) {
            await (client[key] as Resource).update(this, 'GET');
          }
        } else {
          await this.compare(
            server[key] as DataCache<ServerResource>,
            client[key] as DataCache<Resource>,
          )
        }
      })
    )

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
    data: ResourceTypes<R, M>,
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
    await this.sync();
    // if (!this.deferSync) {
    //   await this.sync();
    // }
  }

  getResource<R extends Resources>(resource: R, ...keys: (string | number)[]) {
    return keys.reduce((data, key) => {
      if (!data[key]) throw Error(`Key: ${key} does not exist`);
      return data[key]
    }, this.cache[resource] as { [key: string]: any }) as Resource<ResourceOutput<R, 'GET'>>
  }
}

export class ServerHashCacheV5 {
  cache: { [username: string]: DataCache<ServerResource> | undefined }

  constructor() {
    this.cache = {}
  }

  getHashes(username: string): ServerResponse {
    return this.cache[username] || null;
  }

  async update<R extends Resources, M extends Methods>(
    req: Request,
    username: string,
    data: ResourceOutput<R, M>,
    method: M,
    resource: R,
    ...keys: (string | number)[]
  ) {
    if (!this.cache[username]) this.cache[username] = {};
    const userHashes = this.cache[username]!;
    if (!userHashes[resource]) userHashes[resource] = {};
    const res: ServerResource = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {}
      return (obj as any)[key];
    }, userHashes[resource] as any);
    if (method === 'GET') {
      console.log('SETTING', resource, keys)
      res.hash = await hash(JSON.stringify(data));
      res.url = new URL(req.url).pathname;
      console.log(userHashes)
    } else {
      res.hash = await hash(`${res.hash},${method},${JSON.stringify(data)}`);
    }
  }
}

export const serverHashCacheV5 = new ServerHashCacheV5();
if (!(globalThis as any).serverHashCacheV5) {
  (globalThis as any).serverHashCacheV5 = serverHashCacheV5;
}

const storageKey = 'media-tracker';
export const configV5 = {
  listnames: {
    match: [ 'listname' ],
    url: (client) => `/api/users/${client.username}/lists`,
  },
  listContents: {
    match: [ 'imdbId' ],
    dependent: { name: 'listnames', key: 'id' },
    url: (client, listId: number) => `/api/users/${client.username}/lists/${listId}`,
  },
  // watched: {
  //   url: (client) => `/api/users/${client.username}/watched`,
  // }
} as const satisfies Config

type FillWith<T extends Partial<Record<Methods, any>>, F> = {
  [K in Methods]: K extends keyof T ? T[K] : F
}
// type ExistingMethod<R extends Resources> = keyof typeof configV2['resources'][R]['fetch']
// type ExistingMethod<R extends Resources> = keyof ResourceTypes<R, Methods>
type Resources = keyof typeof configV5;
type ResourceTypes<R extends Resources, M extends Methods> = {
  listnames: FillWith<{
    // POST: {
    //   params: { listname: string, listId: number, imdbId: string }
    // }
  }, any>,
  listContents: FillWith<{
    POST: {
      params: { listname: string, listId: number, imdbId: string }
    }
    DELETE: {
      params: { listname: string, listId: number, imdbId: string }
    }
  }, undefined>,
  watched: FillWith<{}, undefined>,
}[R][M]
type ResourceOutput<R extends Resources, M extends Methods> = {
  listnames: FillWith<{
    GET: Listname[]
  }, undefined>,
  listContents: FillWith<{
    GET: ListItem[],
    DELETE: { imdbId: string }
  }, undefined>,
  watched: FillWith<{}, undefined>,
}[R][M]
// type Config = typeof config;

// TESTING
// const client = new ClientHashCacheV5('me', configV5);
// console.log(client)
// client.update({ listId: 1, listname: 'listname', imdbId: 'imdbId' }, 'POST', 'listnames')
