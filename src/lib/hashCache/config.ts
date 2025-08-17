import { Config, FillResources } from '@/lib/hashCache/types';
import ServerHashCache from '@/lib/hashCache/server';
import {
  ListItem,
  Listname,
  ReviewBody,
  ReviewWithTitle,
  WatchedWithTitle,
} from '@/types';

export type ClientTypes = FillResources<{
  listnames: {
    POST: { params: { listname: string } },
    PUT: { params: { listname: string, newListname: string, id: number } },
    DELETE: { params: { id: number } },
    PATCH: { params: { listname: string, set: string, val: boolean } },
  },
  listContents: {
    POST: {
      params: { listname: string, listId: number, imdbId: string },
    },
    DELETE: {
      params: { listname: string, listId: number, imdbId: string },
    },
    PATCH: { params: { imdbId: string } },
  },
  watched: {
    POST: { params: { imdbId: string } },
    DELETE: { params: { id: number } },
  },
  reviews: {
    POST: {
      params: { imdbId: string },
      body: ReviewBody,
    },
    PUT: {
      params: { imdbId: string },
      body: ReviewBody,
    },
    DELETE: { params: { imdbId: string } },
  },
}>

export type ServerTypes = FillResources<{
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
    GET: WatchedWithTitle[],
    POST: WatchedWithTitle,
    DELETE: { id: number }
  },
  reviews: {
    GET: ReviewWithTitle[],
    POST: ReviewWithTitle,
    PUT: ReviewWithTitle,
    DELETE: { imdbId: string },
  },
}>

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
  },
} as const satisfies Config

declare global {
  var serverHashCacheGlobal: ServerHashCache | undefined;
}
export const serverHashCache = (
  globalThis.serverHashCacheGlobal || new ServerHashCache(config)
);
if (!globalThis.serverHashCacheGlobal) {
  globalThis.serverHashCacheGlobal = serverHashCache;
}
