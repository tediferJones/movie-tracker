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

import { listnames, lists } from '@/drizzle/schema'
import easyFetch from '@/lib/easyFetch';
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

export const serverHashCache = new ServerHashCache();
if (!(globalThis as any).serverHashCache) {
  (globalThis as any).serverHashCache = serverHashCache;
}
