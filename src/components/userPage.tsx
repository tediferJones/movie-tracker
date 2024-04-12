'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/loading';
import MultiTable from '@/components/multiTable';
import ReviewsDisplay from '@/components/reviewsDisplay';
import easyFetch from '@/lib/easyFetch';
import { UserRes } from '@/types';

export default function UserPage({ username, children }: { username: string, children?: ReactNode }) {
  const [user, setUser] = useState<UserRes>();

  useEffect(() => {
    easyFetch<UserRes>('/api/users', 'GET', { username })
      .then(data => setUser(data))
  }, [])

  return (
    <>
      <div className='text-center text-2xl'>
        {username}
      </div>
      {!user ? <Loading /> :
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap gap-4'>

            {children ? children : 
              <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
                <h3 className='text-center text-xl'>Lists ({user.listnames.length})</h3>
                <ScrollArea type='auto' className=''>
                  <div className='flex flex-col gap-4'>
                    {user.listnames.length === 0
                      ? <div className='text-center'>No Lists</div>
                      : user.listnames.map(listname => (
                        <Link className='hover:underline hover:bg-secondary p-2 rounded-lg text-center mx-4'
                          href={`/users/${username}/${listname}`}
                          key={listname}
                        >{listname}</Link>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            }

            <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
              <h3 className='text-center text-xl'>Recently watched ({user.watched.length})</h3>
              <ScrollArea type='auto' className=''>
                <div className='text-center flex flex-col gap-4'>
                  {user.watched.length === 0
                  ? <div className='text-center'>No watch records found</div>
                  : user.watched.map(watchRec => (
                    <div className='flex flex-wrap mx-4 justify-between' key={`${watchRec.imdbId}-${watchRec.date}`}>
                      <Link className='hover:underline flex-1 whitespace-nowrap'
                        href={`/media/${watchRec.imdbId}`}
                      >{watchRec.title}</Link>
                      <span className='w-full text-center'>{new Date(watchRec.date).toLocaleTimeString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          {user.listnames.length === 0 ? [] :
            <MultiTable listnames={user.listnames} username={username} />
          }
          <h3 className='text-xl px-4'>All Reviews</h3>
          <ReviewsDisplay reviews={user.reviews} />
        </div>
      }
    </>
  )
}
