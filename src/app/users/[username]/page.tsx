'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GetBreadcrumbs from '@/components/getBreadcrumbs'
import Loading from '@/components/loading';
import ReviewsDisplay from '@/components/reviewsDisplay';
import MultiTable from '@/components/multiTable';
import easyFetch from '@/lib/easyFetch';
import { UserRes } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function User({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);

  const [user, setUser] = useState<UserRes>();

  useEffect(() => {
    easyFetch<UserRes>('/api/users', 'GET', { username })
      .then(data => setUser(data))
  }, [])

  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{ home: '/', users: '/users', [username]: `/users/${username}` }} />
      <div className='text-center text-2xl'>
        {username}
      </div>
      {!user ? <Loading /> :
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col sm:flex-row gap-4 max-h-[60vh]'>

            <div className='showOutline p-4 flex-1 flex flex-col gap-4'>
              <h3 className='text-center text-xl'>Lists ({user.listnames.length})</h3>
              <ScrollArea type='auto'>
                <div className='flex flex-col gap-4'>
                  {user.listnames.map(listname => (
                    <Link className='hover:underline hover:bg-secondary p-2 rounded-lg text-center mx-4'
                      href={`/users/${username}/${listname}`}
                      key={listname}
                    >{listname}</Link>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className='showOutline p-4 flex-1 flex flex-col gap-4'>
              <h3 className='text-center text-xl'>Recently watched ({user.watched.length})</h3>
              <ScrollArea type='auto'>
              <div className='text-center flex flex-col gap-4'>
                {user.watched.map(watchRec => {
                  return <div className='flex flex-wrap mx-4 justify-between' key={`${watchRec.imdbId}-${watchRec.date}`}>
                    <Link className='hover:underline flex-1 whitespace-nowrap'
                      href={`/media/${watchRec.imdbId}`}
                    >{watchRec.title}</Link>
                    <span className='w-full text-center'>{new Date(watchRec.date).toLocaleTimeString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                  </div>
                })}
              </div>
              </ScrollArea>
            </div>
          </div>
          <MultiTable listnames={user.listnames} username={username} />
          <h3 className='text-xl px-4'>All Reviews</h3>
          <ReviewsDisplay reviews={user.reviews} />
        </div>
      }
    </div>
  )
}
