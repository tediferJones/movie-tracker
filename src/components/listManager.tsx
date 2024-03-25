import { useEffect, useState } from 'react'
import { lists } from '@/drizzle/schema';
import easyFetch from '@/lib/easyFetch'
import Loading from '@/components/loading';

type ListRecord = typeof lists.$inferSelect;

export default function ListManager({ imdbId }: { imdbId: string }) {
  const [lists, setLists] = useState<ListRecord[]>();

  useEffect(() => {
    easyFetch<ListRecord[]>('/api/lists', 'GET', { imdbId })
      .then((data) => setLists(data))
  }, [])

  return (
    <div className='flex-1 flex flex-col gap-4 text-center border-2 p-4'>
      <h1 className='text-xl'>List Manager</h1>
      {!lists ? <Loading /> : 
        <div>{JSON.stringify(lists)}</div>
      }
      <button className='colorPrimary'>Add to List</button>
    </div>
  )
}
