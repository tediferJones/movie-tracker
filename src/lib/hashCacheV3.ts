// how many attempts does it take to make a hashCache?
//
// GOALS:
// - one fetch to /api/sync to get what needs to be synced
// - granular updates (if one list is out of sync only sync that one list not all lists)
//   - would it be easier to manage list updates if lists had a unique ID?

import { listnames, lists, reviews, watched } from '@/drizzle/schema'
import easyFetch, { Methods } from '@/lib/easyFetch'

// title should probably be required for WatchedRec and ExistingReview
type WatchedRec = typeof watched.$inferSelect & { title?: string }
// type ExistingReview = typeof reviews.$inferSelect & { title?: string }
type Listname = typeof listnames.$inferSelect & { id: ListId }
type ListItem = typeof lists.$inferSelect & { id: ListId }
type List = { listname: Listname, listContents: ListItem[] }
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

class ClientHashCache {
  username: string
  userData: UserData
  hashes: Hashes
  storageKey = 'media-tracker'
  // fetch = {
  //   watched: () => easyFetch<WatchedRec[]>({
  //     route: `/api/users/${this.username}/watched`,
  //     method: 'GET',
  //   }),
  //   // listnames: () => easyFetch<Listname[]>({
  //   //   route: `/api/users/${this.username}/lists`,
  //   //   method: 'GET',
  //   // }),
  //   // listContents: (listname: ListId) => easyFetch<ListItem[]>({
  //   //   route: `/api/users/${this.username}/lists/${listname}`,
  //   //   method: 'GET',
  //   // })
  //   lists: async (listId?: ListId) => {
  //     if (!listId) {
  //       // fetch all
  //       const listnames = await easyFetch<Listname[]>({
  //         route: `/api/users/${this.username}/lists`,
  //         method: 'GET',
  //       });
  //       return Object.fromEntries(
  //         await Promise.all(
  //           listnames.map(async listname => {
  //             return [
  //               listname.id,
  //               {
  //                 listname: listname,
  //                 listContents: await easyFetch({
  //                   route: `/api/users/${this.username}/lists`,
  //                   method: 'GET',
  //                 })
  //               }
  //             ]
  //           })
  //         )
  //       );
  //     }
  //   }
  // }
  // compare = {
  //   watched: (clientVal: string, serverVal: string) => {
  //     return clientVal === serverVal
  //   },
  //   lists: (clientLists: UserData['lists'], serverLists: UserData['lists']) => {
  //     const listIds = [
  //       ...new Set(
  //         [ ...Object.keys(clientLists), ...Object.keys(serverLists) ]
  //       )
  //     ].map(Number);
  //     listIds.every(listId => {
  //       if (serverLists[listId].listname !== clientLists[listId].listname) {
  //         return false
  //       }
  //       if (serverLists[listId].listContents !== clientLists[listId].listContents) {
  //         return false
  //       }
  //     })
  //   }
  // }
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
          });
          outOfSyncResult = lists.reduce((outOfSyncResult, listname) => {
            const listId = Number(listname.id);
            this.userData.lists[listId].listname = listname;
            outOfSyncResult[listId] = ['listContents'];
            return outOfSyncResult;
          }, {} as { [key: string]: ('listname' | 'listContents')[] });
        }
        Object.keys(outOfSyncResult).forEach(async listIdStr => {
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
            this.userData.lists[listId].listContents = await easyFetch({
              route: `/api/users/${this.username}/lists/${listname}`,
              method: 'GET',
            });
            this.hashes.lists[listId].listContents = await hash(
              JSON.stringify(this.userData.lists[listId].listContents)
            );
          }
        })
        // const listIds = [
        //   ...new Set(
        //     [
        //       ...Object.keys(clientHashes.lists),
        //       ...Object.keys(serverHashes.lists),
        //     ]
        //   )
        // ].map(Number);
        // let allLists: Listname[];
        // listIds.map(async listId => {
        //   if (clientHashes.lists[listId].listname !== serverHashes.lists[listId].listname) {
        //     if (!allLists) {
        //       allLists = await easyFetch<Listname[]>({
        //         route: `/api/users/${this.username}/lists`,
        //         method: 'GET'
        //       });
        //     }
        //     const updatedListname = allLists.find(list => list.id === listId);
        //     if (!updatedListname) throw Error('cant find updated listname');
        //     this.userData.lists[listId].listname = updatedListname;
        //     this.hashes.lists[listId].listname = await hash(
        //       JSON.stringify(this.userData.lists[listId].listname)
        //     );
        //   }
        //   if (clientHashes.lists[listId].listContents !== serverHashes.lists[listId].listContents) {
        //     const listname = this.userData.lists[listId].listname.listname;
        //     this.userData.lists[listId].listContents = await easyFetch({
        //       route: `/api/users/${this.username}/lists/${listname}`,
        //       method: 'GET',
        //     });
        //     this.hashes.lists[listId].listContents = await hash(
        //       JSON.stringify(this.userData.lists[listId].listContents)
        //     );
        //   }
        // })
      }
    }
  }

  // crawlRec(obj: any, ...keys: string[]): any {
  //   if (keys.length === 0) return obj;
  //   if (!obj[keys[0]]) return;
  //   return this.crawlRec(obj[keys[0]], ...keys.slice(1));
  // }

  constructor(username: string) {
    this.username = username;
    const { userData, hashes } = this.getSavedState(username);
    this.userData = userData;
    this.hashes = hashes;
  }

  getSavedState(username: string): SavedState {
    const { hashes, userData }: SavedState = JSON.parse(
      localStorage.getItem(this.storageKey) || JSON.stringify({})
    )[username];

    return {
      hashes: hashes || { watched: '', lists: {} },
      userData: userData || { watched: [], lists: {} },
    }
  }

  async sync() {
    const syncResult = await easyFetch<SyncResponse>({
      route: '/api/sync',
      method: 'POST',
    });

    if (syncResult === null) {
      Object.keys(this.syncFuncs).map(async resource => {
        await this.syncFuncs[resource as keyof typeof this.syncFuncs].GET()
      })
      return;
    }

    // Object.keys(syncResult).forEach(resource => {
    //   this.syncFuncs[resource as keyof typeof this.syncFuncs](this.hashes, syncResult)
    // })

    // crawl syncResult, if hashes mismatch, fetch results
    // if (!syncResult.watched) {
    //   this.userData.watched = await this.fetch.watched();
    // }

    // Object.keys(syncResult.lists).forEach(key => {
    //   if (!syncResult.lists[Number(key)]) {
    //     // figure out how to determine if we just need to re-fetch the listname (i.e. the list was renamed)
    //     // or if we need to refetch the list's contents
    //     // will probably need to add hashes for listname and listContent to figure this out
    //   }
    // });
    // Object.keys(syncResult).forEach(resource => {
    //   const typedKey = resource as keyof typeof this.compare;
    //   const isSynced = (this.compare[typedKey] as any)(this.hashes[typedKey], syncResult[typedKey])
    //   if (!isSynced) {
    //   }
    // })
    Object.keys(syncResult).forEach(resource => {
      this.syncFuncs[resource as keyof typeof this.syncFuncs].GET(
        this.syncFuncs[resource as keyof typeof this.syncFuncs].isOutOfSync(
          (this.hashes as any)[resource], (syncResult as any)[resource]
        ) as any
      )
    })
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
