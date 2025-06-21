import {
  ReactNode,
  Dispatch,
  SetStateAction,
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { Hashes, Resources, SyncResponse/*, UserData*/, UserDataTypes } from '@/lib/hashCache';
import { useUser } from '@clerk/nextjs';
import easyFetch from '@/lib/easyFetch';
import { resources } from '@/app/api/sync/route';

type EmptyState = { [key: string]: never }
type GetterFuncs = { [K in Resources]: (username: string) => Promise<UserDataTypes<K>> }

type Hash = string
type UserData = {
  hash: Hash,
  data: {
    [K in Resources]: {
      hash: Hash,
      data: UserDataTypes<K>
    }
  }
}

const UserDataContext = createContext<{
  userData: UserData | undefined,
  setUserData: Dispatch<SetStateAction<UserData | undefined>>
} | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>();
  // const hashRef = useRef<Hashes>();
  const { user } = useUser();

  const getters: GetterFuncs = {
    watched: (username) => {
      return easyFetch({
        route: `/api/users/${username}/watched`,
        method: 'GET',
      })
    },
    reviews: (username) => {
      return easyFetch({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      })
    },
  }

  // const emptyState: { hashes: Hashes, userData: UserData } = {
  //   userData:  {
  //     watched: [],
  //     reviews: [],
  //   },
  //   hashes: {
  //     hash: '',
  //     resources: {
  //       watched: '',
  //       reviews: '',
  //     }
  //   }
  // }

  // async function updateHashes(userData: UserData) {
  //   if (!hashRef.current) throw Error('no hashRef found');
  //   await Promise.all(
  //     (Object.keys(userData) as Resources[]).map(async (resource) => {
  //       if (!hashRef.current) throw Error('no hashRef found');
  //       hashRef.current.resources[resource] = await hash(
  //         JSON.stringify(userData[resource])
  //       );
  //     })
  //   );
  //   hashRef.current.hash = await hash(JSON.stringify(userData));
  // }

  async function hash(data: string) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    const buffer = await crypto.subtle.digest('SHA-256', encodedData);
    const byteArray = Array.from(new Uint8Array(buffer));
    return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // this should only handle the initial load,
  // so check for signed in user, if it exists assing userData and Hashes to stored state
  // create a seperate useEffect hook to handle userData state changes
  //  - on userData state change, update hashes and double check sync status
  // can all hashing be done server side? then just send the hash with the data to the client?
  //  - NOPE, this would defeat the purpose of limiting fetches by adding data locally
  //    - for example: if a user adds a new review we do the following:
  //      1.) POST/PUT/DELETE the resouce to /api/user/${username}/${resource}
  //      2.) route should return the resource if the operation is successful
  //      3.) we then modify the local state according to the fetch,
  //      4.) rehash the resource data
  //      5.) then check sync status to make sure hash matches serverside
  // useEffect(() => {
  //   (async () => {
  //     if (!user?.username) return;
  //     const username = user.username;
  //     const savedState = localStorage.getItem('media-tracker');
  //     const { hashes, userData } = savedState ? JSON.parse(savedState) : emptyState;
  //     if (!hashRef.current) hashRef.current = hashes;
  //     console.log({ hashes, userData })
  //     const result = await easyFetch<SyncResponse>({
  //       route: '/api/sync',
  //       method: 'POST',
  //       body: hashes || {},
  //     });
  //     console.log(result)
  //     if (!result.synced) {
  //       await Promise.all(
  //         result.needsSynced.map(async (resource) => {
  //           return userData[resource] = await getters[resource](username);
  //         })
  //       );
  //     }
  //     await updateHashes(userData);
  //     setUserData(userData);
  //     console.log({ userData, hashes: hashRef.current })
  //   })();
  // }, [user?.username, hashRef.current]);

  function getHashObj(userData: UserData) {
    return {
      hash: userData.hash,
      resources: (Object.keys(userData.data) as Resources[]).reduce((hashes, key) => {
        hashes[key] = userData.data[key].hash;
        return hashes;
      }, {} as { [K in Resources]: Hash })
    }
  }

  function setUserResource<K extends Resources>(
    userData: UserData,
    key: K,
    value: UserDataTypes<K>
  ) {
    (userData.data as any)[key].data = value;
  }

  async function buildHashes(userData: UserData) {
    await Promise.all(
      (Object.keys(userData.data) as Resources[]).map(async (resource) => {
        userData.data[resource].hash = await hash(JSON.stringify(userData.data[resource].data));
      })
    );
    userData.hash = await hash(JSON.stringify(userData.data));
  }

  useEffect(() => {
    (async () => {
      if (!user?.username) return;
      console.log('username found')
      // const { username } = user;

      const savedState = localStorage.getItem('media-tracker');
      // let userData: UserData;
      if (!savedState) {
        // fetch and set all
        console.log('no existing state, sync all')
        setUserData({
          hash: '',
          data: resources.reduce((data, key) => {
            data[key] = { hash: '', data: [] }
            return data
          }, {} as { [K in Resources]: { hash: Hash, data: UserDataTypes<K> } })
        });
      } else {
        console.log('state exists')
        setUserData(JSON.parse(savedState))
        // userData = JSON.parse(savedState)
        // console.log(userData)
        // const syncStatus = await easyFetch<SyncResponse>({
        //   route: '/api/sync',
        //   method: 'POST',
        //   body: getHashObj(userData),
        // })
        // console.log('response', syncStatus)
      }

      // await Promise.all(
      //   (outOfSync as Resources[]).map(async (resource) => {
      //     setUserResource(userData, resource, await getters[resource](username));
      //   })
      // );

      // await buildHashes(userData);
      // localStorage.setItem('media-tracker', JSON.stringify(userData));
      // setUserData({ ...userData });

      // console.log({ userData, outOfSync })
    })();
  }, [user?.username]);


  async function sync(username: string, retryCount = 0, maxRetryCount = 5) {
    console.log(`attempting sync ${retryCount}/${maxRetryCount}`)
    if (retryCount >= maxRetryCount) throw Error('failed to sync')
    if (!userData) throw Error('no userData found');
    const { synced, needsSynced } = await easyFetch<SyncResponse>({
      route: '/api/sync',
      method: 'POST',
      body: getHashObj(userData),
    })
    if (synced) return
    console.log({ synced, needsSynced })
    await Promise.all(
      (needsSynced as Resources[]).map(async (resource) => {
        setUserResource(userData, resource, await getters[resource](username));
      })
    );

    await buildHashes(userData);
    localStorage.setItem('media-tracker', JSON.stringify(userData));
    // this is not great, maybe just toggle a boolean to trigger this
    setUserData(userData);
    sync(username, retryCount + 1);
  }

  useEffect(() => {
    if (userData === undefined) return console.log('userData undefined');
    if (!user?.username) throw Error('no username found');
    sync(user.username);
  }, [userData]);

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used with UserDataProvider');
  return context;
}
