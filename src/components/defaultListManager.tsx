'use client';

import easyFetch from '@/lib/easyFetch'
import { useEffect, useState } from 'react'
import Loading from '@/components/loading';
import { useUser } from '@clerk/nextjs';

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  const [defaultListname, setDefaultListname] = useState<string>();
  const { user } = useUser()

  useEffect(() => {
    easyFetch<{ listname: string }[]>('/api/lists', 'GET')
      .then(data => setListnames(data.map(list => list.listname)));
  }, []);

  return (
    !listnames ? <Loading /> :
      <form className='border-2 p-4'
        onSubmit={(e) => {
          e.preventDefault();
          console.log('add new list', defaultListname)
          user?.update({ unsafeMetadata: { defaultListname } })
        }}
      >
        Set default list
        <select className='p-2'
          name='defaultListname'
          value={defaultListname}
          onChange={(e) => setDefaultListname(e.currentTarget.value)}
        >
          {listnames.map(listname => <option key={listname}>
            {listname}
          </option>)}
        </select>
        <button className='colorPrimary'>Set default list</button>
      </form>
  )
}
