import {
  Config,
  DataCache,
  Dependent,
  EasyFetchData,
  Resources,
  ServerResource,
  ServerResponse,
  SyncOpts,
  UserContext,
} from '@/lib/hashCache/types';
import { Dispatch, SetStateAction } from 'react';
import Resource from '@/lib/hashCache/resource';
import { reverseDependencies } from '@/lib/hashCache/helpers';
import { ServerTypes, ClientTypes, storageKey } from '@/lib/hashCache/config';
import easyFetch from '@/lib/easyFetch';
import { Methods } from '@/types';

type SetUserContext = Dispatch<SetStateAction<UserContext>>

type SerializedResource = {
  data: any;
  hash: string;
  url: string;
  dependent?: Dependent;
  isResource: true;
}
type SerializedCache = DataCache<SerializedResource> 

export default class ClientHashCache {
  cache: DataCache<Resource>;
  username: string;
  isSynced = true;
  setState: SetUserContext;
  config: Config;
  deferSync = false;
  setSyncState: Dispatch<SetStateAction<SyncOpts>>;

  constructor(
    username: string,
    config: Config,
    setState: SetUserContext,
    setSyncState: Dispatch<SetStateAction<SyncOpts>>
  ) {
    this.username = username;
    this.setState = setState;
    this.config = config;

    this.setSyncState = setSyncState;
    this.setSyncState('syncing');

    // load state from localStorage, if no state, build from config
    this.cache = this.load() || this.init(config);
    this.sync();
  }

  // setSyncStatus(state: SyncOpts) {
  //   this.isSynced = state;
  //   this.setSyncState(state);
  // }

  init(config: Config): DataCache<Resource> {
    // const isDependent = new Set<string>();
    // const revDependencies = Object.keys(config).reduce((obj, key) => {
    //   if (config[key].dependent) {
    //     isDependent.add(key);
    //     const dep = config[key].dependent!;
    //     obj[dep.name] = { name: key, key: dep.key };
    //   }
    //   return obj;
    // }, {} as { [key: string]: Dependent });
    const { revDeps, dependents } = reverseDependencies(config);

    return Object.keys(config).reduce((cache, key) => {
      if (dependents.has(key)) {
        cache[key] = {};
      } else {
        const url = config[key].url(this);
        cache[key] = new Resource({
          url,
          dependent: revDeps[key],
          match: config[key].match
        });
      }
      return cache;
    }, {} as DataCache<Resource>);
  }

  async sync(retryCount = 0, maxRetryCount = 5) {
    console.log(`V5 sync ${retryCount}/${maxRetryCount}`)
    if (retryCount >= maxRetryCount) {
      throw Error('failed to sync, max retry count reached');
    }
    this.isSynced = true;
    const serverHashes = await easyFetch<ServerResponse>({
      route: '/api/sync',
      method: 'GET',
      params: { v: 5 },
    });
    console.log({ serverHashes, client: this })

    this.deferSync = true;
    if (!serverHashes) {
      await this.getAll();
    } else {
      // we need to address cases where server has more or less keys than client
      // this is especially needed for listContents resource
      // if a list is added on device A, listnames will get synced to device B but listContents[newListId] will not
      // if we include URL server side, it will be much easier to update keys that do not yet exist on the client
      // if a key exists on the client but not on the server, just delete it
      // try {
      //   await this.compare(serverHashes);
      // } catch {
      //   // this isn't a real solution and it defeats the purpose of the hashCache
      //   // we want to fetch each individual resource if doesn't match
      //   console.log('failed to compare, fetching all')
      //   this.cache = this.init(this.config);
      //   await this.getAll();
      // }
      console.log('COMPARING')
      await this.compare(serverHashes)
    }
    this.deferSync = false;

    if (!this.isSynced) {
      console.log('ATTEMPT RESYNC', retryCount + 1, this)
      await this.sync(retryCount + 1);
      return;
    }

    // console.log('SYNCED V5')
    this.save();
    this.setSyncState('synced');
    setTimeout(() => this.setSyncState(''), 1500);
  }

  async getAll(cache = this.cache) {
    for (const key of Object.keys(cache)) {
      console.log('GET ALL', key)
      if (cache[key].isResource) {
        const resource = cache[key] as Resource;
        await resource.update(this, 'GET');
        if (resource.dependent) {
          resource.buildDependencies(this);
        }
      } else {
        console.log('descending into', key, cache[key])
        await this.getAll(cache[key] as DataCache<Resource>);
      }
    }
  }

  async compare(server: DataCache<ServerResource>, client = this.cache) {
    const uniqueKeys = [
      ...new Set(Object.keys(server).concat(Object.keys(client)))
    ];

    const { needsSynced, needsAdded, needsDeleted } = (
      uniqueKeys.reduce((obj, key) => {
        if (client[key] && server[key]) {
          obj.needsSynced.push(key);
        } else if (client[key]) {
          obj.needsDeleted.push(key);
        } else if (server[key]) {
          obj.needsAdded.push(key);
        } else {
          throw Error('This should be impossible');
        }
        return obj
      }, {
          needsSynced: [] as string[],
          needsAdded: [] as string[],
          needsDeleted: [] as string[],
        })
    )

    // console.log({ needsDeleted, needsAdded, needsSynced })
    if (needsDeleted.length) {
      console.log({ server, client })
      throw Error(`want to delete: ${needsDeleted.join(', ')}`)
    }
    needsDeleted.forEach(key => delete client[key]);
    await Promise.all(
      needsAdded.map(async key => {
        console.log('server has new resource, adding and syncing')
        const url = server[key].url;
        // console.log(server, key, url)
        if (typeof url !== 'string') throw Error('Url is not a string');
        const resource = new Resource({ url });
        client[key] = resource;
        await resource.update(this, 'GET');
      })
    );

    await Promise.all(
      needsSynced.map(async key => {
        if (client[key].isResource) {
          if (client[key].hash !== server[key].hash) {
            console.log('SYNCING', key)
            await (client[key] as Resource).update(this, 'GET');
          }
        } else {
          await this.compare(
            server[key] as DataCache<ServerResource>,
            client[key] as DataCache<Resource>,
          );
        }
      })
    );

    // await Promise.all(
    //   Object.keys(server).map(async key => {
    //     if (!client[key]) throw Error('no client key')
    //     if (client[key].isResource) {
    //       if (server[key].hash !== client[key].hash) {
    //         await (client[key] as Resource).update(this, 'GET');
    //       }
    //     } else {
    //       await this.compare(
    //         server[key] as DataCache<ServerResource>,
    //         client[key] as DataCache<Resource>
    //       );
    //     }
    //   })
    // );
  }

  save() {
    console.log('SAVING')
    const allState = JSON.parse(
      localStorage.getItem(storageKey) || JSON.stringify({})
    );
    allState[this.username] = JSON.stringify(this.cache);
    localStorage.setItem(storageKey, JSON.stringify(allState));
    // this.setState({ current: null });
    this.setState({ current: this });
  }

  load() {
    const allState = JSON.parse(
      localStorage.getItem(storageKey) || JSON.stringify({})
    );
    const userState: SerializedCache | undefined = (
      allState[this.username] && JSON.parse(allState[this.username])
    );
    if (userState) {
      console.log('LOADED')
      return this.deserialize(userState);
    }
  }

  deserialize(userState: SerializedCache) {
    return Object.keys(userState).reduce((resources, key) => {
      if (userState[key].isResource) {
        const serialized = userState[key] as SerializedResource;
        resources[key] = new Resource(serialized);
      } else {
        resources[key] = this.deserialize(userState[key] as SerializedCache);
      }
      return resources;
    }, {} as DataCache<Resource>);
  }

  // async update<R extends Resources, M extends Methods>(
  //   data: ClientTypes<R, M>,
  async update<R extends Resources, M extends keyof ClientTypes[R] & Methods>(
    data: ClientTypes[R][M] & EasyFetchData,
    method: M,
    resource: R,
    ...keys: (string | number)[]
  ) {
    const res: Resource = keys.reduce((obj, key) => {
      console.log(obj, key)
      if (!obj[key]) throw Error(`Key ${key} does not exist`);
      return (obj as any)[key];
    }, this.cache[resource] as any);
    if (!res.isResource) throw Error('not a resource');
    await res.update(this, method, data);
    // await this.sync();
    if (!this.deferSync) {
      await this.sync();
    } else {
      console.log('DEFERING SYNC')
    }
  }

  getResource<R extends Resources>(resource: R, ...keys: (string | number)[]) {
    // this should return the resource's .data attribute, not the whole resource
    // unless there is a reason to access other attributes client side
    // but so far there is no need
    // return keys.reduce((data, key) => {
    //   if (!data[key]) throw Error(`Key: ${key} does not exist`);
    //   return data[key]
    // }, this.cache[resource] as { [key: string]: any }) as Resource<ServerTypes<R, 'GET'>>
    const res = keys.reduce((data, key) => {
      if (!data[key]) throw Error(`Key: ${key} does not exist`);
      return data[key]
    // }, this.cache[resource] as { [key: string]: any }) as Resource<ServerTypes<R, 'GET'>>
    }, this.cache[resource] as { [key: string]: any }) as Resource<ServerTypes[R]['GET']>
    return res.data;
  }
}
