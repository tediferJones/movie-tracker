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
import {
  hash,
  resources,
  Resources,
  ResourceTypes,
  SyncResponse,
  UserData,
  ResourceInputTypes,
  Hashes
} from '@/lib/hashCache';
import { useUser } from '@clerk/nextjs';
import easyFetch, { Methods } from '@/lib/easyFetch';

type GetterFuncs = {
  [K in Resources]: {
    [M in Methods]?: (username: string, record: ResourceInputTypes<K, M>) =>  Promise<ResourceTypes<K, M>>
  }
}

type GenericModFunc<K extends Resources, M extends Methods> = (userData: UserData, record: ResourceTypes<K, M>) => void
type ModFuncs = {
  [K in Resources]: {
    [M in Methods]?: GenericModFunc<K, M>
  }
} 

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
//
// Create class for clientHashCache (move most of these function into that class)
//  - class should take userData and setUserData as constructor args
//    - setUserData should probably be a private field so it's not exposed outside of the class
//  - separate hashes from userData, this should simplify some of the data structure crawling
//    - also helps us avoid mutating state variable outside of setUserData to update hashes
//      - in general hash changes should not trigger re-renders, even tho hashes shouldn't change unless userData changes
// ReviewManager should probably be a form instead of just a div
//  - make sure other buttons inside the form have type='button'
// Add listnames field after getting reviews working
//  - do listContents last, it's going to be the most complicated
// Try to come up with a better way to use setUserData, too much spreading in it's current form

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>();
  const { user } = useUser();

  // Maybe rename this to reqFuncs
  const getters: GetterFuncs = {
    watched: {
      GET: (username) => easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'GET',
        params: { testType: 'userContext' },
      }),
      POST: (username, record) => easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'POST',
        params: { testType: 'userContext', ...record },
      }),
      DELETE: (username, record) => easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'DELETE',
        params: { testType: 'userContext', ...record },
      }),
    },
    reviews: {
      GET: (username) => easyFetch({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
        params: { testType: 'userContext' },
      }),
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

  const modFuncs: ModFuncs = {
    watched: {
      POST: (userData, rec) => setUserData({
        ...userData,
        data: {
          ...userData.data,
          watched: {
            ...userData.data.watched,
            data: userData.data.watched.data.concat(rec)
          }
        }
      }),
      DELETE: (userData, rec) => setUserData({
        ...userData,
        data: {
          ...userData.data,
          watched: {
            ...userData.data.watched,
            data: userData.data.watched.data.filter(
              existingRec => existingRec.id !== rec.id
            ),
          }
        }
      })
    },
    reviews: {},
  }

  async function updateResourceHash<K extends Resources, M extends Methods>(
    userData: UserData,
    resource: K,
    method: M,
    record: ResourceTypes<K, M>
  ) {
    const oldHash = userData.data[resource].hash;
    const hashString = `${oldHash},${method},${JSON.stringify(record)}`;
    const newHash = await hash(hashString);
    userData.data[resource].hash = newHash;
    await updateMasterHash(userData);
    const modFunc = modFuncs[resource][method] as GenericModFunc<K, M> | undefined;
    if (!modFunc) throw Error(`Resource ${resource} has no mod func for ${method}`);
    modFunc(userData, record);
    if (!user?.username) throw Error('not logged in');
    await sync(user.username);
  }

  async function modifyResource<K extends Resources, M extends Methods>(
    resource: K,
    method: M,
    record: ResourceInputTypes<K, M>
  ) {
    const reqFunc = getters[resource][method] as (
      username: string,
      record: ResourceInputTypes<K, M>
    ) => Promise<ResourceTypes<K, M>>
    if (!reqFunc) throw Error(`Resource ${resource} has no reqFunc for ${method}`);
    if (!user?.username) throw Error('not logged in');
    const newRecord = await reqFunc(user.username, record);
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
