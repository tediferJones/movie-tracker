import ClientHashCache from '@/lib/hashCache/client';
import { config } from '@/lib/hashCache/config';
import { Methods } from '@/lib/easyFetch';

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

export type FillWith<T extends Partial<Record<Methods, any>>, F> = {
  [K in Methods]: K extends keyof T ? T[K] : F
}

export type UserContext = { current: ClientHashCache | null }

export type SyncOpts = 'notSynced' | 'syncing' | 'synced' | ''

export type OutputConstraints = {
  [R in Resources]: {
    [M in Methods]?: any
  }
}

// export type NormalizeTypeMap = {
//   [R in keyof ServerOutput]: FillWith<ServerOutput[R], undefined>
// }
// export type ServerTypes<R extends keyof NormalizeTypeMap, M extends Methods> = NormalizeTypeMap[R][M]

// alternatively create a fill-fill generic
// for every key in resouces, if key is present, fill with undefined
// for every key that isnt present, fill all of that keys methods with undefined
type TestResource = 'first' | 'second' | 'third'
type TestMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'
// type EnforceMe = FillResources<{
//   first: {},
//   second: {},
//   // third: {},
// }>

export type FillResources<T extends Partial<Record<Resources, any>>> = {
  [K in Resources]: K extends keyof T ? T[K] : FillWith<{}, undefined>
}

// type EnforceResources<T extends Record<string, any>> =
//   Exclude<keyof T, TestResource> extends never ? T : never;

// type EnforceResources<T> = 
//   [TestResource] extends [keyof T]
//     ? Exclude<keyof T, TestResource> extends never
//       ? T
//       : never
//     : never;

// type EnforceResources<T extends Record<TestResource, any>> = T
// type EnforceResources<T> =
//   T extends Record<TestResource, any>
//     ? Exclude<keyof T, TestResource> extends never 
//       ? T
//     : never
//   : never

// type EnforceResources<T extends Record<string, any>> =
//   // Ensure no extra keys
//   Exclude<keyof T, TestResource> extends never
//     // Optionally: ensure all required keys are present
//     ? Exclude<TestResource, keyof T> extends never
//       ? T
//       : never
//     : never;
