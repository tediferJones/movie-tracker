'use client';

import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import UserPage from '@/components/pages/userPage';

export default function User({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  return (
    <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
      <GetBreadcrumbs links={{ home: '/', users: '/users', [username]: `/users/${username}` }} />
      <UserPage username={username} />
    </div>
  )
}
