import easyFetch, { Methods } from '@/lib/easyFetch';

// type FetchFuncs = { [M in Methods]?: (...args: any[]) => Promise<any> }
type EasyFetchData = Omit<Parameters<typeof easyFetch>[0], 'route' | 'method' | 'retryCount'>
// type FetchParams = { [M in Methods]?: (...args: any[]) => EasyFetchData }
type DataCache<T> = { [key: string]: T | DataCache<T> }
type ServerResponse = DataCache<string> | null
type Dependent = { name: string, key: string | number }
type Config = {
  [key: string]: {
    dependent?: Dependent,
    url: (client: ClientHashCacheV5, ...args: any[]) => string,
  }
}

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

  constructor(url: string, dependent?: Dependent) {
    this.hash = '';
    this.url = url;
    this.dependent = dependent;
  }

  async update(cache: ClientHashCacheV5, method: Methods, data?: EasyFetchData) {
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

  constructor(username: string, config: Config) {
    this.username = username;
    this.cache = this.buildCache(config);
  }

  buildCache(config: Config): DataCache<Resource> {
    return Object.keys(config).reduce((cache, key) => {
      if (config[key].dependent) {
        const url = config[key].url(this);
        cache[key] = new Resource(url, config[key].dependent);
      } else {
        cache[key] = {};
      }
      return cache;
    }, {} as DataCache<Resource>);
  }

  async sync(retryCount = 0, maxRetryCount = 5) {
    if (retryCount >= maxRetryCount) {
      throw Error('failed to sync, max retry count reached');
    }
    const serverHashes = await easyFetch<ServerResponse>({
      route: '/api/sync',
      method: 'GET',
      params: { v: 5 },
    });
    console.log(serverHashes)
    // if (!serverHashes) {
    //   this.getAll();
    // } else {
    //   this.compare(serverHashes);
    // }
    // await this.sync(retryCount + 1);
  }

  async getAll(cache = this.cache) {
    for (const key of Object.keys(cache)) {
      if (cache[key].isResource) {
        console.log('getting', key)
        const resource = cache[key] as Resource;
        await resource.update(this, 'GET');
      } else {
        console.log('descending into', key)
        this.getAll(cache[key] as DataCache<Resource>);
      }
    }
  }

  compare(server: DataCache<string>, client = this.cache) {
  }
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

export const configV5 = {
  listnames: {
    dependent: { name: 'listContents', key: 'id' },
    url: (client) => `/api/users/${client.username}/lists`,
  },
  listContents: {
    url: (client, listId: number) => `/api/users/${client.username}/lists/${listId}`,
  },
  // This will be treated as a nested resource, which is a problem
  // nested resources should be marked as dependent, not the parent resource
  // watched: {
  //   url: (client) => `/api/users/${client.username}/watched`,
  // }
} as const satisfies Config

// type Config = typeof config;

// TESTING

// const client = new ClientHashCacheV5('me', configV5);
// console.log(client)
