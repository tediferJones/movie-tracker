'use client';

import easyFetch from '@/lib/easyFetch'
import { useEffect, useState } from 'react'
import Loading from '@/components/loading';
// import { listnames } from '@/drizzle/schema';

// type ListnameRecord = typeof listnames.$inferSelect;

export default function ListnameManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [listnames, setListnames] = useState<string[]>();

  useEffect(() => {
    easyFetch<{ listname: string }[]>('/api/lists', 'GET')
      .then(data => {
        console.log(data)
      });
  }, [refreshTrigger]);

  return (
    <div className='border-2 p-4'>
      Create new list or set default list
      {/*
      {!listnames ? <Loading /> : 
        <div className='flex flex-col gap-4 p-4 text-center'>
          {listnames.map(listnameRecord => <span
            key={listnameRecord.listname}
          >{listnameRecord.listname}</span>
          )}
        </div>
      }
      */}
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log(e.currentTarget.newListname.value)
        console.log('add new list')
        // easyFetch('/api/listnames', 'POST', { listname: e.currentTarget.newListname.value }, true)
        //   .then(() => setRefreshTrigger(!refreshTrigger))
      }}>
        <input id='newListname' type='text' className='p-2' />
        <button className='colorPrimary'>Add new List</button>
      </form>
    </div>
  )
}
