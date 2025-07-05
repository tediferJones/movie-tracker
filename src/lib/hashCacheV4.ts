// ROUND 4, FIGHT

import { listnames } from '@/drizzle/schema'
import { ExistingMediaInfo } from '@/types'
import easyFetch from './easyFetch';
type Listname = typeof listnames.$inferSelect

const resources = [ 'listnames', 'lists' ] as const
type ResourceKeys = typeof resources | string

type SavedState = { hashes: Hashes, userData: UserData }
type ListId = string;
type UserData = {
  listnames: Listname[],
} & {
  [key: ListId]: ExistingMediaInfo[],
}
type Hashes = {
  listnames: string,
} & {
  [key: ListId]: string,
}

const testParams = { testType: 'userContext' }

const config = {
  listnames: {
    GET: async (clientHashCache: ClientHashCache) => {
      console.log('setting listnames')
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
    GET: async (clientHashCache: ClientHashCache) => {
      console.log('setting listContents')
      clientHashCache.userData.listnames.forEach(async listname => {
        const resources = await easyFetch<ExistingMediaInfo[]>({
          route: `/api/users/${clientHashCache.username}/lists/${listname.id}`,
          method: 'GET',
          params: testParams,
        });
        const hashCacheKey = `list-${listname.id}`;
        clientHashCache.userData[hashCacheKey] = resources;
        await clientHashCache.updateHash(hashCacheKey, 'GET', resources);
      })
    }
  }
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
      for (const resource of resources) {
        await config[resource].GET(this);
        await this.updateHash(resource, 'GET', this.userData[resource]);
      }
      console.log('INITIAL SYNC COMPLETE')
      return this.sync();
    }

    // Server should always have the most up to date data
    const isSynced = Object.keys(serverHashes).filter(resource => {
      return this.hashes[resource] !== serverHashes[resource];
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
