import { useEffect, useState } from 'react';
import { useUserData } from '@/context/userData';
import useIsSelf from '@/hooks/useIsSelf';

// wait for hashCache to be loaded,
// and verify username belongs to logged in user
// FIX ME this could have a better name
export default function useIsSettled(username: string) {
  const [isSettled, setIsSettled] = useState<boolean | null>(null);
  const isSelf = useIsSelf(username);
  const userData = useUserData();

  useEffect(() => {
    if (userData.current === null) return;
    if (userData.current === false) {
      setIsSettled(false);
      return;
    }
    setIsSettled(isSelf && userData.current.username === username);
  }, [userData, isSelf]);

  return isSettled;
}
