'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { watched } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import AutoPaging from '@/components/subcomponents/AutoPaging';
import easyFetch from '@/lib/easyFetch';
import { useUserData } from '@/context/userData';
import { useUser } from '@clerk/nextjs';

type WatchedRec = typeof watched.$inferSelect & { title: string }

function useIsSelf(username: string) {
  const [isSelf, setIsSelf] = useState<null | boolean>(null);

  const { user, isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user && user.username === username) {
      setIsSelf(true);
    } else {
      setIsSelf(false);
    }
  }, [isLoaded, isSignedIn, user]);

  return isSelf;
}

export default function WatchedDisplay({ username }: { username: string }) {
  const [watched, setWatched] = useState<WatchedRec[]>();
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const displayCount = page * pageSize;
  const isSelf = useIsSelf(username);

  const userData = useUserData();
  useEffect(() => {
    if (isSelf === null) return;
    if (isSelf) {
      if (!userData.current) return;
      console.log('using userData')
      setWatched(userData.current.getResource('watched').data);
    } else {
      console.log('fetching')
      easyFetch<WatchedRec[]>({
        route: `/api/users/${username}/watched`,
        method: 'GET',
      }).then(data => setWatched(data));
    }
  }, [userData.current, isSelf]);

  return (
    <div className='showOutline p-4 flex-1 flex flex-col gap-4 max-h-96 min-w-72'>
      {!watched ? <Loading/> :
        <>
          <h3 className='text-center text-xl'>Recently Watched ({watched.length})</h3>
          <div className='h-full flex flex-col justify-center overflow-hidden'>
            <div className='overflow-auto flex flex-col'>
              {watched.length === 0
                ? <p className='text-center text-muted-foreground'>No Watch History Found</p>
                : watched.slice(0, displayCount).map((watchRec, i) => (
                  <Link className='flex-1 flex flex-col hover:bg-secondary rounded-lg p-2 mx-4 group text-center'
                    href={`/media/${watchRec.imdbId}`}
                    key={`watchedDisplay-${i}`}
                  >
                    <span className='group-hover:underline'>{watchRec.title}</span>
                    <span className='text-foreground w-full text-center'>
                      {new Date(watchRec.date).toLocaleTimeString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </Link>
                ))
              }
              <AutoPaging
                setPage={setPage}
                currentCount={displayCount}
                maxCount={watched.length}
              />
            </div>
          </div>
        </>
      }
    </div>
  )
}
