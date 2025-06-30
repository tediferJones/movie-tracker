// how many attempts does it take to make a hashCache?
//
// GOALS:
// - one fetch to /api/sync to get what needs to be synced
// - granular updates (if one list is out of sync only sync that one list not all lists)
//   - would it be easier to manage list updates if lists had a unique ID?

import { listnames, lists, reviews, watched } from '@/drizzle/schema'
import easyFetch from '@/lib/easyFetch'

// title should probably be required for WatchedRec and ExistingReview
type WatchedRec = typeof watched.$inferSelect & { title?: string }
// type ExistingReview = typeof reviews.$inferSelect & { title?: string }
type Listname = typeof listnames.$inferSelect & { id: ListId }
type ListItem = typeof lists.$inferSelect & { id: ListId }
type List = { listname: Listname, listContents: ListItem[] }

type ListId = number
type UserData = {
  watched: WatchedRec[],
  lists: { [key: ListId]: List },
}

type Hashes = {
  watched: string,
  lists: { [key: ListId]: string },
}

type SavedState = { hashes: Hashes, userData: UserData }

type SyncResponse = {
  watched: boolean,
  lists: { [key: ListId]: boolean },
} | null

class ClientHashCache {
  username: string
  userData: UserData
  hashes: Hashes
  storageKey = 'media-tracker'
  fetch = {
    watched: () => easyFetch<WatchedRec[]>({
      route: `/api/users/${this.username}/watched`,
      method: 'GET',
    }),
    listnames: () => easyFetch<Listname[]>({
      route: `/api/users/${this.username}/lists`,
      method: 'GET',
    }),
    listContents: (listname: ListId) => easyFetch<ListItem[]>({
      route: `/api/users/${this.username}/lists/${listname}`,
      method: 'GET',
    })
  }

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
      // fetch and set all
      this.userData.watched = await this.fetch.watched();
      const listnames = await this.fetch.listnames();
      const listContents = Object.fromEntries(
        await Promise.all(
          listnames.map(async ({ id }) => {
            const item = await this.fetch.listContents(id)
            return [id, item]
          })
        )
      );
      this.userData.lists = listnames.reduce((lists, listname) => {
        lists[listname.id] = {
          listname,
          listContents: listContents[listname.id],
        }
        return lists;
      }, {} as { [key: ListId]: List });
      return;
    }

    // crawl syncResult, if hashes mismatch, fetch results
    if (!syncResult.watched) {
      this.userData.watched = await this.fetch.watched();
    }

    Object.keys(syncResult.lists).forEach(key => {
      if (!syncResult.lists[Number(key)]) {
        // figure out how to determine if we just need to re-fetch the listname (i.e. the list was renamed)
        // or if we need to refetch the list's contents
        // will probably need to add hashes for listname and listContent to figure this out
      }
    });
  }
}

class ServerHashCache {
  cache: { [key: string]: Hashes | undefined }

  constructor() {
    this.cache = {}
  }

  getHashes(username: string) {
    return this.cache[username] || null
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
