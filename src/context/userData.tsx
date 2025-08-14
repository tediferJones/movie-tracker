'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import { useUser } from '@clerk/nextjs';
import { UserContext, SyncOpts } from '@/lib/hashCache/types';
import ClientHashCache from '@/lib/hashCache/client';
import { config } from '@/lib/hashCache/config';

const UserDataContext = createContext<UserContext>({ current: null });

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [hashCache, setHashCache] = useState<UserContext>({ current: null });
  const [syncState, setSyncState] = useState<SyncOpts>('');

  useEffect(() => {
    if (!user?.username) {
      setHashCache({ current: null });
      return;
    }
    // FIX ME,
    // hashCache should only be assigned to window for testing purposes
    (window as any).hashCache = new ClientHashCache(
      user.username,
      config,
      setHashCache,
      setSyncState,
    );
  }, [user?.username]);

  return (
    <UserDataContext.Provider value={hashCache}>
      <SyncStatusContext.Provider value={syncState}>
        {children}
      </SyncStatusContext.Provider>
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error('useUserData must be used with UserDataProvider');
  return context;
}

const SyncStatusContext = createContext<SyncOpts>('');
export const useSyncStatus = () => useContext(SyncStatusContext);
