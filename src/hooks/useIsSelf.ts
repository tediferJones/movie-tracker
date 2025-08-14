import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function useIsSelf(username: string) {
  const [isSelf, setIsSelf] = useState<null | boolean>(null);

  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    setIsSelf(isSignedIn && user && user.username === username);
  }, [isLoaded, isSignedIn, user]);

  return isSelf;
}
