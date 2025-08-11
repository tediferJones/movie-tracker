import ClientHashCache from '@/lib/hashCache/client';
import { config } from '@/lib/hashCache/config';
import easyFetch from '@/lib/easyFetch';
import { FillWith } from '@/types';

export type DataCache<T> = { [key: string]: T | DataCache<T> }

export type Dependent = { name: string, key: string }

export type ServerResource = {
  hash: string,
  url: string,
  dependent: Dependent
  isResource: true,
}

export type ServerResponse = DataCache<ServerResource> | null

export type Matcher = string[] 

export type Config = {
  [key: string]: {
    match: Matcher,
    dependent?: Dependent,
    url: (client: ClientHashCache, ...args: any[]) => string,
  }
}

export type Resources = keyof typeof config;

export type UserContext = { current: ClientHashCache | null }

export type SyncOpts = 'notSynced' | 'syncing' | 'synced' | ''

export type FillResources<T extends Partial<Record<Resources, any>>> = {
  [K in Resources]: K extends keyof T ? T[K] : FillWith<{}, undefined>
}

export type EasyFetchData = Omit<
  Parameters<typeof easyFetch>[0],
  'route' | 'method' | 'retryCount'
>
