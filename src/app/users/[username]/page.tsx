'use client';

import GetBreadcrumbs from '@/components/getBreadcrumbs'
import easyFetch from '@/lib/easyFetch';
import { useEffect, useState } from 'react';

export default function User({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);

  const [user, setUser] = useState<any>();

  useEffect(() => {
    easyFetch('/api/users', 'GET', { username })
      .then(data => {
        console.log(data)
        setUser(data)
      })
  }, [])

  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{ home: '/', users: '/users', [username]: `/users/${username}` }} />
      <div className='text-center text-2xl'>
        {username}
      </div>
      {JSON.stringify(user) || 'not found'}
    </div>
  )
}
