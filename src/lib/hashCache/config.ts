import { listnames, reviews, watched } from '@/drizzle/schema';
import { Config, Resources, FillWith, FillResources } from '@/lib/hashCache/types';
import ServerHashCache from '@/lib/hashCache/server';
import { Methods } from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';

// FIX ME
// These types should be moved to the global types file
import { ReviewBody } from '@/components/pages/mediaPage/reviewManager';
type Listname = typeof listnames.$inferSelect
export type ListItem = ExistingMediaInfo & { dateAdded: number }
type WatchedRec = typeof watched.$inferSelect & { title: string }
type Review = typeof reviews.$inferSelect & { title: string }

export type ClientTypes<R extends Resources, M extends Methods> = {
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

export type ServerTypesTest = FillResources<{
  listnames: {
    GET: Listname[],
    POST: Listname,
    PUT: Listname,
    DELETE: { id: number }
    PATCH: Listname,
  },
  listContents: {
    GET: ListItem[],
    POST: ListItem,
    PATCH: ListItem,
    DELETE: { imdbId: string },
  },
  watched: {
    GET: WatchedRec[],
    POST: WatchedRec,
    DELETE: { id: number }
  },
  reviews: {
    GET: Review[],
    POST: Review,
    PUT: Review,
    DELETE: { imdbId: string },
  }
}>

export type ServerTypes<R extends Resources, M extends Methods> = {
  listnames: FillWith<{
    GET: Listname[],
    POST: Listname,
    PUT: Listname,
    DELETE: { id: number }
    PATCH: Listname,
  }, undefined>,
  listContents: FillWith<{
    GET: ListItem[],
    POST: ListItem,
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


// FIX ME
// this should also get moved into config
export const storageKey = 'media-tracker';

export const config = {
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

// FIX ME
// Consider moving this to its own file or something, just feels a little out of place here
//
// copy this pattern over to regular server cache if it proves to work correctly
declare global {
  var serverHashCacheGlobal: ServerHashCache | undefined;
}
export const serverHashCacheV5 = (
  globalThis.serverHashCacheGlobal || new ServerHashCache(config)
);
if (!globalThis.serverHashCacheGlobal) {
  console.log('SETTING HASH CACHE')
  globalThis.serverHashCacheGlobal = serverHashCacheV5;
}
