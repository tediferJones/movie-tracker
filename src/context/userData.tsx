'use client';

import {
  ReactNode,
  Dispatch,
  SetStateAction,
  useState,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { hash, resources, Resources, ResourceTypes, SyncResponse, UserData, ResourceInputTypes, Hashes } from '@/lib/hashCache';
import { useUser } from '@clerk/nextjs';
import easyFetch, { Methods } from '@/lib/easyFetch';
// import { resources } from '@/app/api/sync/route';
import { reviews, watched } from '@/drizzle/schema';


// type WatchedRec = typeof watched.$inferSelect & { title: string }
// type ExistingReview = typeof reviews.$inferSelect & { title?: string }
// export type UserDataTypes<T extends Resources, K extends Methods> = {
//   watched: WatchedRec,
//   reviews: ExistingReview,
// }[T]

// type GetterFuncs = { [K in Resources]: (username: string) => Promise<UserDataTypes<K>> }
// type GetterFuncs = {
//   [K in Resources]: {
//     [M in Methods]?: (username: string, record: M extends 'GET' ? undefined : UserDataTypes<K>) => M extends 'GET' ? Promise<UserDataTypes<K>[]> : Promise<UserDataTypes<K>>
//   }
// }
type GetterFuncs = {
  [K in Resources]: {
    [M in Methods]?: (username: string, record: ResourceInputTypes<K, M>) =>  Promise<ResourceTypes<K, M>>
  }
}

// type ModifyFunc = <K extends Resources, M extends Methods>(
//   resource: K,
//   method: M,
//   record: ResourceInputTypes<K, M>
// ) => Promise<ResourceTypes<K, M>>

// type Hash = string
// type UserData = {
//   hash: Hash,
//   data: {
//     [K in Resources]: {
//       hash: Hash,
//       data: UserDataTypes<K>
//     }
//   }
// }

const UserDataContext = createContext<{
  userData: UserData | undefined,
  setUserData: Dispatch<SetStateAction<UserData | undefined>>,
  modifyResource: <K extends Resources, M extends Methods>(
    resource: K,
    method: M,
    record: ResourceInputTypes<K, M>
  ) => Promise<ResourceTypes<K, M>>,
} | null>(null);

// export async function hash(data: string) {
//   const encoder = new TextEncoder();
//   const encodedData = encoder.encode(JSON.stringify(data));
//   const buffer = await crypto.subtle.digest('SHA-256', encodedData);
//   const byteArray = Array.from(new Uint8Array(buffer));
//   return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
// }

// can all hashing be done server side? then just send the hash with the data to the client?
//  - NOPE, this would defeat the purpose of limiting fetches by adding data locally
//    - for example: if a user adds a new review we do the following:
//      1.) POST/PUT/DELETE the resouce to /api/user/${username}/${resource}
//      2.) route should return the resource if the operation is successful
//      3.) we then modify the local state according to the fetch,
//      4.) rehash the resource data 
//        - add method to hash string, otherwise POST someRecord and DELETE someRecord could have the same hash
//          - Example: await hash(oldHash + method + JSON.string(resource))
//      5.) then check sync status to make sure hash matches serverside

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>();
  const { user } = useUser();

  // const getters: GetterFuncs = {
  //   watched: (username) => {
  //     return easyFetch({
  //       route: `/api/users/${username}/watched`,
  //       method: 'GET',
  //       params: { testType: 'userContext' }
  //     })
  //   },
  //   reviews: (username) => {
  //     return easyFetch({
  //       route: `/api/users/${username}/reviews`,
  //       method: 'GET',
  //       params: { testType: 'userContext' }
  //     })
  //   },
  // }

  const getters: GetterFuncs = {
    watched: {
      GET: (username) => easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'GET',
        params: { testType: 'userContext' }
      }),
      POST: (username, record) => easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'POST',
        params: { testType: 'userContext', ...record }
      })
    },
    reviews: {
      GET: (username) => easyFetch({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
        params: { testType: 'userContext' }
      })
    }
  }

  function getHashObj(userData: UserData) {
    return {
      hash: userData.hash,
      resources: (Object.keys(userData.data) as Resources[]).reduce((hashes, key) => {
        hashes[key] = userData.data[key].hash;
        return hashes;
      }, {} as Hashes['resources'])
    }
  }

  function setUserResource<K extends Resources>(
    userData: UserData,
    key: K,
    value: ResourceTypes<K, 'GET'>
  ) {
    (userData.data as any)[key].data = value;
  }

  function updateState<K extends Resources>(
    userData: UserData,
    resource: K,
    record: ResourceTypes<K, 'GET'>[number]
  ) {
    setUserData({
      ...userData,
      data: {
        ...userData.data,
        [resource]: {
          ...userData.data[resource],
          data: userData.data[resource].data.concat(record)
        }
      }
    })
  }

  async function updateResourceHash<K extends Resources, M extends Methods>(
    userData: UserData,
    resource: K,
    method: M,
    record: ResourceTypes<K, M>
  ) {
    const oldHash = userData.data[resource].hash;
    const hashString = `${oldHash},${method},${JSON.stringify(record)}`
    const newHash = await hash(hashString);
    userData.data[resource].hash = newHash;
    await updateMasterHash(userData);
    if (method !== 'POST') throw Error('this is just a proof of concept')
    // setUserData((prev) => {
    //   console.log('updating state', record)
    //   // console.log(JSON.stringify(prev) === JSON.stringify(userData))
    //   if (!prev) throw Error('no previous userData')
    //   prev.data.watched.data = prev.data.watched.data.concat(record as any)
    //   return { ...prev }
    // })
    // setUserData({
    //   ...userData,
    //   data: {
    //     ...userData.data,
    //     watched: {
    //       ...userData.data.watched,
    //       data: userData.data.watched.data.concat(record as any)
    //     }
    //   }
    // })
    if (!record) throw Error()
    // FIX ME, type should not be 'as any'
    updateState(userData, resource, record as any)
    if (!user?.username) throw Error('not logged in');
    await sync(user.username);
  }

  async function modifyResource<K extends Resources, M extends Methods>(
    resource: K,
    method: M,
    record: ResourceInputTypes<K, M>
  ) {
    const modFunc = getters[resource][method] as (
      username: string,
      record: ResourceInputTypes<K, M>
    ) => Promise<ResourceTypes<K, M>>
    if (!modFunc) throw Error('post func for watched no found in context');
    if (!user?.username) throw Error('not logged in');
    const newRecord = await modFunc(user.username, record);
    if (!userData) throw Error('no userData found');
    await updateResourceHash(userData, resource, method, newRecord);
    return newRecord;
  }

  async function buildHashes(userData: UserData) {
    await Promise.all(
      (Object.keys(userData.data) as Resources[]).map(async (resource) => {
        userData.data[resource].hash = await hash(JSON.stringify(userData.data[resource].data));
      })
    );
    // userData.hash = await hash(JSON.stringify(userData.data));
    // userData.hash = await hash(JSON.stringify(getHashObj(userData).resources))
    await updateMasterHash(userData);
  }

  async function updateMasterHash(userData: UserData) {
    userData.hash = await hash(JSON.stringify(getHashObj(userData).resources));
  }

  useEffect(() => {
    (async () => {
      if (!user?.username) return;
      const savedState = localStorage.getItem('media-tracker');
      if (!savedState) {
        // fetch and set all
        console.log('no existing state, sync all')
        setUserData({
          hash: '',
          data: resources.reduce((data, key) => {
            data[key] = { hash: '', data: [] as any }
            return data
          }, {} as UserData['data'])
        });
      } else {
        console.log('state exists')
        setUserData(JSON.parse(savedState))
      }
    })();
  }, [user?.username]);


  async function sync(username: string, retryCount = 0, maxRetryCount = 5) {
    if (retryCount === 0) console.log('starting sync')
    console.log(`attempting sync ${retryCount}/${maxRetryCount}`)
    if (retryCount >= maxRetryCount) throw Error('failed to sync');
    if (!userData) throw Error('no userData found');
    const { synced, needsSynced } = await easyFetch<SyncResponse>({
      route: '/api/sync',
      method: 'POST',
      body: getHashObj(userData),
    });
    if (synced) return console.log('SYNC SUCCESSFUL');
    // console.log({ synced, needsSynced })
    await Promise.all(
      (needsSynced as Resources[]).map(async (resource) => {
        // if (!getters[resource].GET) throw Error(`No GET method for resource "${resource}" found in getters`)
        const fetchFunc = getters[resource].GET
        if (!fetchFunc) throw Error(`No GET method for resource "${resource}" found in getters`);
        setUserResource(userData, resource, await fetchFunc(username, undefined));
      })
    );

    await buildHashes(userData);
    localStorage.setItem('media-tracker', JSON.stringify(userData));
    // this is not great, maybe just toggle a boolean to trigger this
    // this needs to be fixed, changes are not reflected in userData
    setUserData(() => ({ ...userData }));
    sync(username, retryCount + 1);
  }

  useEffect(() => {
    if (userData === undefined) return console.log('userData undefined');
    if (!user?.username) throw Error('no username found');
    sync(user.username);
  }, [userData]);

  return (
    <UserDataContext.Provider value={{ userData, setUserData, modifyResource }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used with UserDataProvider');
  return context;
}
