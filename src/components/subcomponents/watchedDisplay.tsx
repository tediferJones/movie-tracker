'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { watched } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';

type WatchedRec = typeof watched.$inferSelect & { title: string }

export default function WatchedDisplay({ username }: { username: string }) {
  const [watched, setWatched] = useState<WatchedRec[]>();

  useEffect(() => {
    easyFetchV3<WatchedRec[]>({
      route: `/api/users/${username}/watched`,
      method: 'GET',
    }).then(data => setWatched(data));
  }, []);

  return (
    <div className='showOutline p-4 flex-1 flex flex-col gap-4 max-h-96 min-w-72'>
      {!watched ? <Loading/> :
        <>
          <h3 className='text-center text-xl'>Recently Watched ({watched.length})</h3>
          <div className='h-full flex flex-col justify-center overflow-hidden'>
            <ScrollArea type='auto' className='flex flex-col'>
              {watched.length === 0
                ? <p className='text-center text-muted-foreground'>No Watch History Found</p>
                : watched.map(watchRec => (
                  <Link className='flex-1 flex flex-col hover:bg-secondary rounded-lg p-2 mx-4 group text-center'
                    href={`/media/${watchRec.imdbId}`}
                  >
                    <span className='group-hover:underline'>{watchRec.title}</span>
                    <span className='text-foreground w-full text-center'>{new Date(watchRec.date).toLocaleTimeString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                  </Link>
                ))}
            </ScrollArea>
          </div>
        </>
      }
    </div>
  )
}
