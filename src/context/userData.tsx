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
import { Hashes, Resources, SyncResponse, UserData, UserDataTypes } from '@/lib/hashCache';
import { useUser } from '@clerk/nextjs';
import easyFetch from '@/lib/easyFetch';

type EmptyState = { [key: string]: never }
type GetterFuncs = { [K in Resources]: (username: string) => Promise<UserDataTypes<K>> }

const UserDataContext = createContext<{
  userData: UserData | EmptyState,
  setUserData: Dispatch<SetStateAction<UserData | EmptyState>>
} | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | EmptyState>({});
  const hashRef = useRef<Hashes>();
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

  const emptyState: { hashes: Hashes, userData: UserData } = {
    userData:  {
      watched: [],
      reviews: [],
    },
    hashes: {
      hash: '',
      resources: {
        watched: '',
        reviews: '',
      }
    }
  }

  async function updateHashes(userData: UserData) {
    if (!hashRef.current) throw Error('no hashRef found');
    await Promise.all(
      (Object.keys(userData) as Resources[]).map(async (resource) => {
        if (!hashRef.current) throw Error('no hashRef found');
        hashRef.current.resources[resource] = await hash(
          JSON.stringify(userData[resource])
        );
      })
    );
    hashRef.current.hash = await hash(JSON.stringify(userData));
  }

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
  useEffect(() => {
    (async () => {
      if (!user?.username) return;
      const username = user.username;
      const savedState = localStorage.getItem('media-tracker');
      const { hashes, userData } = savedState ? JSON.parse(savedState) : emptyState;
      if (!hashRef.current) hashRef.current = hashes;
      console.log({ hashes, userData })
      const result = await easyFetch<SyncResponse>({
        route: '/api/sync',
        method: 'POST',
        body: hashes || {},
      });
      console.log(result)
      if (!result.synced) {
        await Promise.all(
          result.needsSynced.map(async (resource) => {
            return userData[resource] = await getters[resource](username);
          })
        );
      }
      await updateHashes(userData);
      setUserData(userData);
      console.log({ userData, hashes: hashRef.current })
    })();
  }, [user?.username, hashRef.current]);

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
