'use client';

import { useEffect, useState } from 'react';
import easyFetch from '@/lib/easyFetch';
import { useUser } from '@clerk/nextjs';
import Loading from '@/components/subcomponents/loading';

export default function CheatWatch() {
  const [error, setError] = useState<string>();
  const [username, setUsername] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (!user?.username) return;
    setUsername(user.username);
  }, [user?.username]);

  return (
    !username ? <Loading /> :
      <div className='flex justify-center w-full'>
        <form className='flex flex-col gap-4 items-center'
          onSubmit={(e) => {
            e.preventDefault();
            setError(undefined);
            const date = new Date(e.currentTarget.date.value).getTime();
            const imdbId = e.currentTarget.imdbId.value;
            if (date > Date.now()) {
              return setError('Cant use a date in the future');
            }

            // FIX ME
            // Could try adding this route to hashCache client
            // but it is probably not worth it,
            // refreshing the page will trigger a refetch anyways
            easyFetch<Response>({
              route: `/api/users/${username}/cheatwatch`,
              method: 'POST',
              params: { useHashCache: true },
              body: { date, imdbId },
              skipJSON: true,
            }).then(res => setError(res.ok ? 'Success' : 'Failed'));
          }}
        >
          Cheat your watch records
          <div className='flex gap-4'>
            <label className='my-auto' htmlFor='date'>Desired Date</label>
            <input className='p-2'
              id='date'
              name='date'
              type='datetime-local'
              required
            />
          </div>
          <div className='flex gap-4'>
            <label className='my-auto' htmlFor='imdbId'>IMDB ID</label>
            <input className='p-2'
              id='imdbId'
              name='imdbId'
              type='text'
              required
            />
          </div>
          {error && <span className='text-red-500'>Error: {error}</span>}
          <button type='submit'>Submit</button>
        </form>
      </div>
  )
}
