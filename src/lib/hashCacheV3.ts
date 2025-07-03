// how many attempts does it take to make a hashCache?
//
// GOALS:
// - one fetch to /api/sync to get what needs to be synced
// - granular updates (if one list is out of sync only sync that one list not all lists)
//   - would it be easier to manage list updates if lists had a unique ID?
//
// In order to get this working we'll have to do a couple things
// 1.) import new db schema (see schema file for how to do this)
// 2.) adjust /lists/[listname] route to take and use listnameIds
// 3.) probably a good idea just go around and revert front-end to using fetch in every component
//      - this will make it easier to troubleshoot hashCacheV3
//
// Unrelated but fix media schema 'type' property, right now it actually named 'text'

import { listnames, lists, reviews, watched } from '@/drizzle/schema'
import easyFetch, { Methods } from '@/lib/easyFetch'
import { ExistingMediaInfo } from '@/types'

// title should probably be required for WatchedRec and ExistingReview
type WatchedRec = typeof watched.$inferSelect & { title?: string }
// type ExistingReview = typeof reviews.$inferSelect & { title?: string }
type Listname = typeof listnames.$inferSelect & { id: ListId }
// type ListItem = typeof lists.$inferSelect & { id: ListId }
type List = { listname: Listname, listContents: ExistingMediaInfo[] }
type ListObj = { [key: string]: List }

type ListId = number
type UserData = {
  watched: WatchedRec[],
  lists: ListObj,
}

type Hashes = {
  watched: string,
  lists: {
    [key: ListId]: {
      listname: string,
      listContents: string,
    }
  },
}

type SavedState = { hashes: Hashes, userData: UserData }

// type SyncResponse = {
//   watched: boolean,
//   lists: {
//     [key: ListId]: {
//       listname: boolean,
//       listContents: boolean,
//     }
//   },
// } | null
type SyncResponse = Hashes | null

async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// const emptyListEntry = () => ({
//   listname: {} as any,
//   listContents: [] as any,
// })

export class ClientHashCache {
  username: string
  userData: UserData
  hashes: Hashes
  storageKey = 'media-tracker'
  syncFuncs = {
    watched: {
      isOutOfSync: (clientHash: Hashes['watched'], serverHash: Hashes['watched']) => {
        return clientHash !== serverHash;
      },
      GET: async (outOfSyncResult?: boolean) => {
        if (outOfSyncResult === false) return;
        this.userData.watched = await easyFetch({
          route: `/api/users/${this.username}/watched`,
          method: 'GET',
        });
        this.hashes.watched = await hash(
          JSON.stringify(this.userData.watched)
        );
      }
    },
    lists: {
      isOutOfSync: (clientHash: Hashes['lists'], serverHash: Hashes['lists']) => {
        const listIds = [
          ...new Set(
            [ ...Object.keys(clientHash), ...Object.keys(serverHash) ]
          )
        ].map(Number);
        return listIds.reduce((outOfSync, listId) => {
          if (clientHash[listId].listname !== serverHash[listId].listname) {
            if (outOfSync[listId]) outOfSync[listId] = [];
            outOfSync[listId].push('listname');
          }
          if (clientHash[listId].listContents !== serverHash[listId].listContents) {
            if (outOfSync[listId]) outOfSync[listId] = [];
            outOfSync[listId].push('listContents');
          }
          return outOfSync;
        }, {} as { [key: ListId]: ('listname' | 'listContents')[] });
      },
      GET: async (outOfSyncResult?: { [key: ListId]: ('listname' | 'listContents')[] }) => {
        let lists: Listname[];
        if (!outOfSyncResult) {
          lists = await easyFetch<Listname[]>({
            route: `/api/users/${this.username}/lists`,
            method: 'GET',
            params: { testType: 'userContext' }
          });
          outOfSyncResult = lists.reduce((outOfSyncResult, listname) => {
            const listId = Number(listname.id);
            if (!this.userData.lists[listId]) this.userData.lists[listId] = this.getEmptyListVal();
            this.userData.lists[listId].listname = listname;
            outOfSyncResult[listId] = ['listContents'];
            return outOfSyncResult;
          }, {} as { [key: string]: ('listname' | 'listContents')[] });
        }
          Object.keys(outOfSyncResult).map(async listIdStr => {
            const listId = Number(listIdStr);
            const needsUpdated = outOfSyncResult[listId];
            if (needsUpdated.includes('listname')) {
              if (!lists) {
                lists = await easyFetch<Listname[]>({
                  route: `/api/users/${this.username}/lists`,
                  method: 'GET',
                });
              }
              const listname = lists.find(list => list.id === listId);
              if (!listname) throw Error('could not find matching listname');
              this.userData.lists[listId].listname = listname;
              this.hashes.lists[listId].listname = await hash(
                JSON.stringify(this.userData.lists[listId].listname)
              );
            }
            if (needsUpdated.includes('listContents')) {
              const listname = this.userData.lists[listId].listname;
              const listContents = await easyFetch<ExistingMediaInfo[]>({
                route: `/api/users/${this.username}/lists/${listname.listname}`,
                method: 'GET',
              });
              this.userData.lists[listId].listContents = listContents;
              if (!this.hashes.lists[listId]) this.hashes.lists[listId] = this.getEmptyListVal();
              this.hashes.lists[listId].listContents = await hash(
                JSON.stringify(this.userData.lists[listId].listContents)
              );
            }
          })
      }
    }
  }

  getEmptyListVal() {
    return {
      listname: {} as any,
      listContents: [] as any,
    }
  }

  constructor(username: string) {
    this.username = username;
    const { userData, hashes } = this.getSavedState(username);
    this.userData = userData;
    this.hashes = hashes;
    this.sync();
  }

  getSavedState(username: string): SavedState {
    const { hashes, userData }: SavedState = JSON.parse(
      localStorage.getItem(this.storageKey) || JSON.stringify({})
    )[username] || {};

    return {
      hashes: hashes || { watched: '', lists: {} },
      userData: userData || { watched: [], lists: {} },
    }
  }

  async sync() {
    const syncResult = await easyFetch<SyncResponse>({
      route: '/api/sync',
      method: 'GET',
      params: { v: 3 }
    });

    if (syncResult === null) {
      console.log('syncResult is empty, get all resources')
      Object.keys(this.syncFuncs).map(async resource => {
        await this.syncFuncs[resource as keyof typeof this.syncFuncs].GET()
      });
      return;
    }

    console.log('doing actual syncing')
    Object.keys(syncResult).forEach(resource => {
      this.syncFuncs[resource as keyof typeof this.syncFuncs].GET(
        this.syncFuncs[resource as keyof typeof this.syncFuncs].isOutOfSync(
          (this.hashes as any)[resource], (syncResult as any)[resource]
        ) as any
      )
    });
  }

  async updateHash(resource: string) {
    (this.hashes as any)[resource] = await hash((this.userData as any)[resource])
  }
}

class ServerHashCache {
  cache: { [key: string]: Hashes | undefined }
  hashers = {
    watched: {
      GET: async (hashes: Hashes, record: WatchedRec[]) => {
        hashes.watched = await hash(JSON.stringify(record));
      }
    },
    lists: {
      GET: async (hashes: Hashes, record: ListObj) => {
        Object.keys(record).forEach(async listIdKey => {
          const listId = Number(listIdKey) ;
          hashes.lists[listId] = {
            listname: await hash(JSON.stringify(record[listId].listname)),
            listContents: await hash(JSON.stringify(record[listId].listContents)),
          }
        })
      }
    }
  }

  constructor() {
    this.cache = {}
  }

  getHashes(username: string) {
    return this.cache[username] || null
  }

  async updateResource(
    username: string,
    method: Methods,
    resource: keyof Hashes,
    record: any
  ) {
    if (!this.cache[username]) {
      this.cache[username] = {
        watched: '',
        lists: {},
      }
    }

    await this.hashers[resource][method as 'GET'](this.cache[username]!, record)
  }

  // compareHashes(username: string, clientHashes: Hashes): SyncResponse | null {
  //   const serverHashes = this.cache[username]
  //   if (!serverHashes) return null

  //   const { lists, ...other } = clientHashes;
  //   const otherHashResults = (
  //     (Object.keys(other) as (keyof typeof other)[])
  //     .reduce((needsSynced, key) => {
  //       needsSynced[key] = clientHashes[key] === serverHashes[key];
  //       return needsSynced;
  //     }, {} as Omit<SyncResponse, 'lists'>)
  //   );

  //   const listHashResults = (
  //     Object.keys(lists).reduce((listsNeedSynced, listname) => {
  //       listsNeedSynced[listname] = {
  //         listname: serverHashes.lists[listname] === lists[listname],
  //         listContents: serverHashes.lists[listname] === lists[listname],
  //       }
  //       return listsNeedSynced;
  //     }, {} as SyncResponse['lists'])
  //   );

  //   return {
  //     ...otherHashResults,
  //     lists: listHashResults,
  //   }
  // }
}

// user has no saved state
// posts empty hashes object to /api/sync

// how many states exist for list sync state
// 1.) all lists are in sync
// 2.) listnames match, list contents does not
// 3.) listnames do not match, list contents does
// 4.) all lists are out of sync
