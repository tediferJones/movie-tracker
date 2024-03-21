'use client';

import { useState, useEffect } from 'react';
import { lists } from '@prisma/client';
import ExpandableList from '@/components/ExpandableList';
import easyFetch from '@/modules/easyFetch';

export default function DisplayMediaLists({ imdbID }: { imdbID: string }) {
  const [lists, setLists] = useState<lists[] | null>(null);

  useEffect(() => {
    easyFetch('/api/lists', 'GET', { imdbID })
      .then((data: lists[]) => setLists(data))
  }, []);

  function uniqueUsers() {
    let result: string[] = []
    if (lists) {
      lists.forEach((list: lists) => result.includes(list.username) ? undefined : result.push(list.username))
    }
    return result;
  }

  function listItems() {
    if (!lists) return [];

    return lists.map((item: lists) => {
      return (
        <div className='p-4 m-2 bg-gray-700 flex justify-between' key={`${item.username}-${item.listname}`}>
          <h2 className='my-auto'>{item.username}</h2>
          <h2 className='my-auto'>{item.listname}</h2>
          <a className='p-2 bg-blue-400'
            href={`/lists/${item.username}/${item.listname}`}
          >Go To List</a>
        </div>
      )
    })
  }

  return (
    <div className='w-4/5 mx-auto'>
      <h1 className='text-xl ml-4'>Display Media Lists</h1>
      {lists === null ? <h1>Loading...</h1> : 
        lists.length === 0 ? <h1 className='text-center py-4'>This media does not appear in any user's lists</h1> :
          <>
            <h1 className='ml-4'>
              This media appears in {lists.length} list{lists.length === 1 ? '' : 's'}, 
              from {uniqueUsers().length} {uniqueUsers().length === 1 ? 'user' : 'different users'}
            </h1>
            <ExpandableList arr={listItems()} />
          </>
      }
    </div>
  )
}
