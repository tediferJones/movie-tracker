'use client'

import easyFetch from '@/lib/easyFetch';
import { useState } from 'react';

export default function CheatWatch() {
  const [error, setError] = useState<string>();
  return (
    <div className='flex justify-center w-full'>
      <form className='flex flex-col gap-4 items-center'
        onSubmit={(e) => {
          e.preventDefault();
          setError(undefined);
          const date = new Date(e.currentTarget.date.value).getTime();
          const imdbId = e.currentTarget.imdbId.value;
          if (date > Date.now()) {
            return setError('Cant use a date in the future')
          }

          easyFetch<Response>('/api/cheatwatch', 'POST', { date, imdbId }, true)
            .then(res => setError(res.ok ? 'Success' : 'Failed'))
        }}
      >
        Cheat your watch records
        <div className='flex gap-4'>
          <label className='my-auto' htmlFor='date'>Desired Date</label>
          <input className='p-2' id='date' name='date' type='datetime-local' required />
        </div>
        <div className='flex gap-4'>
          <label className='my-auto' htmlFor='imdbId'>IMDB ID</label>
          <input className='p-2' id='imdbId' name='imdbId' type='text' required />
        </div>
        {error ? <span className='text-red-500'>Error: {error}</span> : []}
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}
