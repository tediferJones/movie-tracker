import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react'
import { watched } from '@/drizzle/schema'
import Loading from '@/components/subcomponents/loading';
import easyFetch from '@/lib/easyFetch'
import { useUser } from '@clerk/nextjs';

type WatchRecord = typeof watched.$inferSelect;

export default function WatchManger({ imdbId }: { imdbId: string }) {
  const [watched, setWatched] = useState<WatchRecord[]>()
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // useEffect(() => {
  //   easyFetch<WatchRecord[]>('/api/watched', 'GET', { imdbId })
  //     .then(data => setWatched(data));
  // }, [refreshTrigger])

  const { user } = useUser();
  useEffect(() => {
    if (!user?.username) return
    console.log('got user info', user.username)
    easyFetch<WatchRecord[]>(`/api/users/${user.username}/watched`, 'GET', { imdbId })
      .then(data => setWatched(data));
  }, [refreshTrigger, user?.username])

  return (
    <div className='flex flex-col justify-between gap-4 p-4 text-center showOutline sm:flex-1 sm:w-auto w-full max-h-[60vh]'>
      <h1 className='text-xl'>Watch Manager</h1>
      {!watched ? <Loading /> : 
        <ScrollArea type='auto'>
          <div className='flex flex-col gap-4 overflow-y-auto'>
            {!watched.length ? 'No records found' : watched.map(record => {
              const date = new Date(record.date)
              return (
                <span key={record.date} className='flex items-center justify-center px-4'>
                  <span className='w-full'>
                    {date.toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })} at {date.toLocaleTimeString()}
                  </span>
                  <button type='button'
                    onClick={() => {
                      easyFetch('/api/watched', 'DELETE', { id: record.id }, true)
                        .then(() => setRefreshTrigger(!refreshTrigger))
                    }}
                  >
                    <span className='sr-only'>Delete watch record</span>
                    <Trash2 className='min-h-6 min-w-6 text-red-700' />
                  </button>
                </span>
              )
            })}
          </div>
        </ScrollArea>
      }
      <Button onClick={() => {
        easyFetch(`/api/users/${user?.username}/watched`, 'POST', { imdbId }, true)
          .then(() => setRefreshTrigger(!refreshTrigger))
      }}>New Record</Button>
    </div>
  )
}
