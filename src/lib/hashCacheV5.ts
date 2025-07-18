import easyFetch, { Methods } from '@/lib/easyFetch';

// type FetchFuncs = { [M in Methods]?: (...args: any[]) => Promise<any> }
type EasyFetchData = Omit<Parameters<typeof easyFetch>[0], 'route' | 'method' | 'retryCount'>
// type FetchParams = { [M in Methods]?: (...args: any[]) => EasyFetchData }
type DataCache<T> = { [key: string]: T | DataCache<T> }
type ServerResponse = DataCache<string> | null
type Dependent = { name: string, key: string }
type Config = {
  [key: string]: {
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

const testParams = { testType: 'userContext' }

async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const dataHandlers: { [M in Methods]?: (extData: any[], newData: any) => any[] } = {
  GET: (extData, newData) => newData,
}

class Resource {
  data: any;
  hash: string;
  url: string;
  dependent?: Dependent;
  isResource = true;

  constructor(url: string, dependent?: Dependent, hash?: string, data?: any) {
    this.url = url;
    this.dependent = dependent;
    this.hash = hash || '';
    this.data = data;
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
        (cache.cache[this.dependent.name] as any)[key] = new Resource(`${this.url}/${key}`);
      })
    }

    const modFunc = dataHandlers[method];
    if (!modFunc) throw Error(`No modFunc found for ${method}`);
    this.data = modFunc(this.data, result);
    if (method === 'GET') {
      this.hash = await hash(JSON.stringify(this.data));
    } else {
      this.hash = await hash(`${this.hash},${method},${result}`);
    }
  }
}

export class ClientHashCacheV5 {
  cache: DataCache<Resource>;
  username: string;
  isSynced = true;

  constructor(username: string, config: Config) {
    this.username = username;
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
        cache[key] = new Resource(url, revDependencies[key]);
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
      // params: { v: 5 },
    });
    console.log(serverHashes)

    if (!serverHashes) {
      await this.getAll();
    } else {
      await this.compare(serverHashes);
    }

    if (!this.isSynced) {
      await this.sync(retryCount + 1);
    }

    console.log('SYNCED V5')
    this.save();
  }

  async getAll(cache = this.cache) {
    for (const key of Object.keys(cache)) {
      if (cache[key].isResource) {
        console.log('getting', key)
        const resource = cache[key] as Resource;
        await resource.update(this, 'GET');
      } else {
        console.log('descending into', key)
        await this.getAll(cache[key] as DataCache<Resource>);
      }
    }
  }

  async compare(server: DataCache<string>, client = this.cache) {
    await Promise.all(
      Object.keys(server).map(async key => {
        if (client[key].isResource) {
          if (server[key] !== client[key].hash) {
            await (client[key] as Resource).update(this, 'GET');
          }
        } else {
          console.log('descend compare', key)
          await this.compare(
            server[key] as DataCache<string>,
            client[key] as DataCache<Resource>
          )
        }
      })
    )
  }

  save() {
    const allState = JSON.parse(
      localStorage.getItem(storageKey) || JSON.stringify({})
    );
    allState[this.username] = JSON.stringify(this.cache);
    localStorage.setItem(storageKey, JSON.stringify(allState));
  }

  load() {
    const allState = JSON.parse(
      localStorage.getItem(storageKey) || JSON.stringify({})
    );
    const userState: SerializedCache | undefined = JSON.parse(
      allState[this.username]
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
        resources[key] = new Resource(
          // just make new Resource take an object where URL is required, everything else is optional
          serialized.url,
          serialized.dependent,
          serialized.hash,
          serialized.data,
        );
      } else {
        resources[key] = this.deserialize(userState[key] as SerializedCache);
      }
      return resources;
    }, {} as DataCache<Resource>);
  }

  // update<R extends Resources, M extends Methods>(data: ResourceTypes<R, M>, method: M, resource: R) {
  // }
}

export class ServerHashCacheV5 {
  cache: { [username: string]: DataCache<string> | undefined }

  constructor() {
    this.cache = {}
  }

  getHashes(username: string): ServerResponse {
    return this.cache[username] || null
  }
}

export const serverHashCacheV5 = new ServerHashCacheV5();
if (!(globalThis as any).serverHashCacheV5) {
  (globalThis as any).serverHashCacheV5 = serverHashCacheV5;
}

const storageKey = 'media-tracker';
export const configV5 = {
  listnames: {
    // dependent: { name: 'listContents', key: 'id' },
    url: (client) => `/api/users/${client.username}/lists`,
  },
  listContents: {
    dependent: { name: 'listnames', key: 'id' },
    url: (client, listId: number) => `/api/users/${client.username}/lists/${listId}`,
  },
  watched: {
    url: (client) => `/api/users/${client.username}/watched`,
  }
} as const satisfies Config

// type FillWith<T extends Partial<Record<Methods, any>>, F> = {
//   [K in Methods]: K extends keyof T ? T[K] : F
// }
// type ExistingMethod<R extends Resources> = keyof typeof configV2['resources'][R]['fetch']
// type ExistingMethod<R extends Resources> = keyof ResourceTypes<R, Methods>
// type Resources = keyof typeof configV5;
// type ResourceTypes<R extends Resources, M extends Methods> = {
//   listnames: FillWith<{
//     POST: { listname: string, listId: number, imdbId: string }
//   }, undefined>,
//   listContents: FillWith<{}, number>,
//   watched: FillWith<{}, boolean>,
// }[R][M]
// type Config = typeof config;

// TESTING
// const client = new ClientHashCacheV5('me', configV5);
// console.log(client)
// client.update({ listId: 1, listname: 'listname', imdbId: 'imdbId' }, 'POST', 'listnames')
