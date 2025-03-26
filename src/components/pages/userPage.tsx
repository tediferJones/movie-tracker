'use client';

import { ReactNode, useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import ReviewsDisplay from '@/components/subcomponents/reviewsDisplay';
import WatchedDisplay from '@/components/subcomponents/watchedDisplay';
import ListsDisplay from '@/components/subcomponents/listsDisplay';
import MultiTable from '@/components/table/multiTable';
import easyFetch from '@/lib/easyFetch';
import { UserRes } from '@/types';

export default function UserPage({ username, children }: { username: string, children?: ReactNode }) {
  const [user, setUser] = useState<UserRes>();

  useEffect(() => {
    easyFetch<UserRes>('/api/users', 'GET', { username })
      .then(data => setUser(data))
  }, [])

  return !user ? <Loading /> :
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-4'>
        <WatchedDisplay username={username} />
        {children ? children : <ListsDisplay username={username} /> }
      </div>
      {user.listnames.length === 0 ? [] :
        <MultiTable username={username}
          listnames={user.listnames}
          defaultListname={user.defaultList}
        />
      }
      <h3 className='text-xl px-4'>Your Reviews</h3>
      <ReviewsDisplay username={username} />
    </div>
}
