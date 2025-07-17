'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { useUser } from '@clerk/nextjs';
import { ClientHashCacheV4, UserContext, configV2 } from '@/lib/hashCacheV4';
import { ClientHashCacheV5, configV5 } from '@/lib/hashCacheV5';

const UserDataContext = createContext<UserContext>({ current: null });

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [hashCache, setHashCache] = useState<UserContext>({ current: null });

  useEffect(() => {
    if (!user?.username) {
      setHashCache({ current: null });
      return;
    }
    new ClientHashCacheV4(configV2, user.username, setHashCache);
    (window as any).hashCache = new ClientHashCacheV5(user.username, configV5);
  }, [user?.username]);

  return (
    <UserDataContext.Provider value={hashCache}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used with UserDataProvider');
  return context;
}

// OLD VERSION
// import {
//   ReactNode,
//   Dispatch,
//   SetStateAction,
//   useState,
//   createContext,
//   useContext,
//   useEffect,
// } from 'react';
// import {
//   hash,
//   resources,
//   Resources,
//   ResourceTypes,
//   SyncResponse,
//   UserData,
//   ResourceInputTypes,
//   Hashes,
//   // isNormalResource,
//   // isSpecialResource
// } from '@/lib/hashCache';
// import { useUser } from '@clerk/nextjs';
// import easyFetch, { Methods } from '@/lib/easyFetch';
// import { ClientHashCache, ClientHashCacheV2, ClientHashCacheV3, ClientHashCacheV4, UserContext, configV2, initFunc } from '@/lib/hashCacheV4';
// 
// type GetterFuncs = {
//   [K in Resources]: {
//     [M in Methods]?: (username: string, record: ResourceInputTypes<K, M>) =>  Promise<ResourceTypes<K, M>>
//   }
// }
// 
// type GenericModFunc<K extends Resources, M extends Methods> = (userData: UserData, record: ResourceTypes<K, M>) => void
// type ModFuncs = {
//   [K in Resources]: {
//     [M in Methods]?: GenericModFunc<K, M>
//   }
// } 

// const UserDataContext = createContext<{
//   userData: UserData | undefined,
//   setUserData: Dispatch<SetStateAction<UserData | undefined>>,
//   modifyResource: <K extends Resources, M extends Methods>(
//     resource: K,
//     method: M,
//     record: ResourceInputTypes<K, M>
//   ) => Promise<ResourceTypes<K, M>>,
// } | null>(null);

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
// Keep in mind that we should still probably be using serverCaching for user resources
//  - for example if 5 other users all look at userA's profile it is still beneficial to cache userA's resources
//  - also related, we could do use a technique similar to the hashCache to prevent refetching
//    - when userA POSTs a new watch record, review, etc... update the server cache accordingly instead of just deleting and refetching
//      - server cache can still use a timer to delete entries that haven't been used in a while
// Once everything is working go back over all files that use userData or hashTable and clean them up
//  - dont forget to add try catch blocks for api stuff
//  - dont forget to reimplement server caching where appropiate
//  - add await to all calls to hashTable.updateResource/setResource
//  - add await to all calls to userData.updateResource/setResource
// UPDATE LISTNAMES TABLE TO CASCADE CHANGES TO LISTS TABLE

// export function UserDataProvider({ children }: { children: ReactNode }) {
//   const [userData, setUserData] = useState<UserData>();
//   const { user } = useUser();
// 
//   // Maybe rename this to reqFuncs
//   const getters: GetterFuncs = {
//     watched: {
//       GET: (username) => easyFetch({
//         route: `/api/users/${username}/watched`,
//         method: 'GET',
//         params: { testType: 'userContext' },
//       }),
//       POST: (username, record) => easyFetch({
//         route: `/api/users/${username}/watched`,
//         method: 'POST',
//         params: { testType: 'userContext', ...record },
//       }),
//       DELETE: (username, record) => easyFetch({
//         route: `/api/users/${username}/watched`,
//         method: 'DELETE',
//         params: { testType: 'userContext', ...record },
//       }),
//     },
//     reviews: {
//       GET: (username) => easyFetch({
//         route: `/api/users/${username}/reviews`,
//         method: 'GET',
//         params: { testType: 'userContext' },
//       }),
//       POST: (username, { imdbId, ...record }) => easyFetch({
//         route: `/api/users/${username}/reviews`,
//         method: 'POST',
//         params: { testType: 'userContext', imdbId },
//         body: record,
//       }),
//       PUT: (username, { imdbId, ...record }) => easyFetch({
//         route: `/api/users/${username}/reviews`,
//         method: 'PUT',
//         params: { testType: 'userContext', imdbId },
//         body: record,
//       }),
//       DELETE: (username, { imdbId }) => easyFetch({
//         route: `/api/users/${username}/reviews`,
//         method: 'DELETE',
//         params: { testType: 'userContext', imdbId },
//       })
//     },
//     listnames: {
//       GET: (username) => easyFetch({
//         route: `/api/users/${username}/lists`,
//         method: 'GET',
//         params: { testType: 'userContext' },
//       }),
//       POST: (username, listname) => easyFetch({
//         route: `/api/users/${username}/lists`,
//         method: 'POST',
//         params: { testType: 'userContext', ...listname },
//       }),
//       PUT: (username, listname) => easyFetch({
//         route: `/api/users/${username}/lists`,
//         method: 'PUT',
//         params: { testType: 'userContext', ...listname },
//       }),
//       DELETE: (username, listname) => easyFetch({
//         route: `/api/users/${username}/lists`,
//         method: 'DELETE',
//         params: { testType: 'userContext', ...listname },
//       })
//     },
//     // listContents: {
// 
//     // }
//   }
// 
//   function getHashObj(userData: UserData) {
//     return {
//       hash: userData.hash,
//       resources: (Object.keys(userData.data) as Resources[]).reduce((hashes, key) => {
//         // if (isNormalResource(key)) {
//         //   hashes[key] = userData.data[key].hash;
//         // } else if (isSpecialResource(key)) {
//         //   hashes[key] = {
//         //     hash: userData.data[key].hash,
//         //     data: Object.keys(userData.data[key].data).reduce((hashObj, innerKey) => {
//         //       hashObj[innerKey] = userData.data[key].data[innerKey].hash
//         //       return hashObj
//         //     }, {} as { [key: string]: string })
//         //   }
//         // } else {
//         //   throw Error('resource not recognized')
//         // }
//         hashes[key] = userData.data[key].hash;
//         return hashes;
//       }, {} as Hashes['resources'])
//     }
//   }
// 
//   function setUserResource<K extends Resources>(
//     userData: UserData,
//     key: K,
//     value: ResourceTypes<K, 'GET'>
//   ) {
//     (userData.data as any)[key].data = value;
//   }
// 
//   const modFuncs: ModFuncs = {
//     watched: {
//       POST: (userData, rec) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           watched: {
//             ...userData.data.watched,
//             data: userData.data.watched.data.concat(rec)
//           }
//         }
//       }),
//       DELETE: (userData, rec) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           watched: {
//             ...userData.data.watched,
//             data: userData.data.watched.data.filter(
//               existingRec => existingRec.id !== rec.id
//             ),
//           }
//         }
//       })
//     },
//     reviews: {
//       POST: (userData, rec) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           reviews: {
//             ...userData.data.reviews,
//             data: userData.data.reviews.data.concat(rec),
//           }
//         }
//       }),
//       PUT: (userData, rec) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           reviews: {
//             ...userData.data.reviews,
//             data: userData.data.reviews.data.filter(existingRec => existingRec.imdbId !== rec.imdbId).concat(rec),
//           }
//         }
//       }),
//       DELETE: (userData, { imdbId }) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           reviews: {
//             ...userData.data.reviews,
//             data: userData.data.reviews.data.filter(existingRec => existingRec.imdbId !== imdbId),
//           }
//         }
//       })
//     },
//     listnames: {
//       POST: (userData, listRec) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           listnames: {
//             ...userData.data.listnames,
//             data: userData.data.listnames.data.concat(listRec),
//           }
//         }
//       }),
//       PUT: (userData, { listname, newListname }) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           listnames: {
//             ...userData.data.listnames,
//             data: userData.data.listnames.data.map(listRec => {
//               if (listRec.listname !== listname) return listRec;
//               return {
//                 ...listRec,
//                 listname: newListname,
//               }
//             })
//           }
//         }
//       }),
//       DELETE: (userData, { listname }) => setUserData({
//         ...userData,
//         data: {
//           ...userData.data,
//           listnames: {
//             ...userData.data.listnames,
//             data: userData.data.listnames.data.filter(listRec => listRec.listname !== listname),
//           }
//         }
//       })
//     },
//     // listContents: {
// 
//     // }
//   }
// 
//   async function updateResourceHash<K extends Resources, M extends Methods>(
//     userData: UserData,
//     resource: K,
//     method: M,
//     record: ResourceTypes<K, M>
//   ) {
//     const oldHash = userData.data[resource].hash;
//     const hashString = `${oldHash},${method},${JSON.stringify(record)}`;
//     const newHash = await hash(hashString);
//     userData.data[resource].hash = newHash;
//     await updateMasterHash(userData);
//     const modFunc = modFuncs[resource][method] as GenericModFunc<K, M> | undefined;
//     if (!modFunc) throw Error(`Resource ${resource} has no mod func for ${method}`);
//     modFunc(userData, record);
//     if (!user?.username) throw Error('not logged in');
//     await sync(user.username);
//   }
// 
//   async function modifyResource<K extends Resources, M extends Methods>(
//     resource: K,
//     method: M,
//     record: ResourceInputTypes<K, M>
//   ) {
//     // Why? I do not know, typescript just decided to throw a hissy fit here
//     const reqFunc = getters[resource][method] as any as (
//       username: string,
//       record: ResourceInputTypes<K, M>
//     ) => Promise<ResourceTypes<K, M>>
//     if (!reqFunc) throw Error(`Resource ${resource} has no reqFunc for ${method}`);
//     if (!user?.username) throw Error('not logged in');
//     const newRecord = await reqFunc(user.username, record);
//     console.log('newRecord', newRecord)
//     if (!userData) throw Error('no userData found');
//     await updateResourceHash(userData, resource, method, newRecord);
//     return newRecord;
//   }
// 
//   async function buildHashes(userData: UserData) {
//     await Promise.all(
//       (Object.keys(userData.data) as Resources[]).map(async (resource) => {
//         userData.data[resource].hash = await hash(JSON.stringify(userData.data[resource].data));
//       })
//     );
//     // userData.hash = await hash(JSON.stringify(userData.data));
//     // userData.hash = await hash(JSON.stringify(getHashObj(userData).resources))
//     await updateMasterHash(userData);
//   }
// 
//   async function updateMasterHash(userData: UserData) {
//     userData.hash = await hash(JSON.stringify(getHashObj(userData).resources));
//   }
// 
//   useEffect(() => {
//     // (async () => {
//     //   if (!user?.username) return;
//     //   const savedState = localStorage.getItem('media-tracker');
//     //   if (!savedState) {
//     //     // fetch and set all
//     //     console.log('no existing state, sync all')
//     //     setUserData({
//     //       hash: '',
//     //       data: resources.reduce((data, key) => {
//     //         // data[key] = { hash: '', data: key === 'listContents' ? {} : [] as any }
//     //         data[key] = { hash: '', data: [] }
//     //         return data
//     //       }, {} as UserData['data'])
//     //     });
//     //   } else {
//     //     console.log('state exists')
//     //     setUserData(JSON.parse(savedState))
//     //   }
//     // })();
//     if (!user?.username) return;
//     // (window as any).hashCache = new ClientHashCache(user.username);
//     // (window as any).hashCache = new ClientHashCacheV2(initFunc);
//     // (window as any).hashCache = new ClientHashCacheV3(user.username);
//     const hashCache = new ClientHashCacheV4(configV2, user.username);
//     (window as any).hashCache = hashCache;
//   }, [user?.username]);
// 
//   async function sync(username: string, retryCount = 0, maxRetryCount = 5) {
//     if (retryCount === 0) console.log('starting sync')
//     console.log(`attempting sync ${retryCount}/${maxRetryCount}`)
//     if (retryCount >= maxRetryCount) throw Error('failed to sync');
//     if (!userData) throw Error('no userData found');
//     const { synced, needsSynced } = await easyFetch<SyncResponse>({
//       route: '/api/sync',
//       method: 'POST',
//       body: getHashObj(userData),
//     });
//     console.log({ synced, needsSynced }, userData)
//     if (synced) return console.log('SYNC SUCCESSFUL');
//     // console.log({ synced, needsSynced })
//     await Promise.all(
//       (needsSynced as Resources[]).map(async (resource) => {
//         // if (!getters[resource].GET) throw Error(`No GET method for resource "${resource}" found in getters`)
//         const fetchFunc = getters[resource].GET
//         if (!fetchFunc) throw Error(`No GET method for resource "${resource}" found in getters`);
//         setUserResource(userData, resource, await fetchFunc(username, undefined));
//       })
//     );
// 
//     await buildHashes(userData);
//     localStorage.setItem('media-tracker', JSON.stringify(userData));
//     // this is not great, maybe just toggle a boolean to trigger this
//     // this needs to be fixed, changes are not reflected in userData
//     setUserData(() => ({ ...userData }));
//     sync(username, retryCount + 1);
//   }
// 
//   // useEffect(() => {
//   //   if (userData === undefined) return console.log('userData undefined');
//   //   if (!user?.username) throw Error('no username found');
//   //   sync(user.username);
//   // }, [userData]);
// 
//   // useEffect(() => {
//   //   if (!user?.username) return
//   //   // console.log('HashCacheV3', new ClientHashCache(user.username))
//   //   (window as any).hashCache = new ClientHashCache(user.username)
//   // }, [user?.username]);
// 
//   return (
//     <UserDataContext.Provider value={{ userData, setUserData, modifyResource }}>
//       {children}
//     </UserDataContext.Provider>
//   )
// }
