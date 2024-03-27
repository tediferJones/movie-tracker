import { useEffect, useState } from 'react'
import easyFetch from '@/lib/easyFetch'
import Loading from '@/components/loading';
import { Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function ListManager({ imdbId }: { imdbId: string }) {
  const [lists, setLists] = useState<string[]>();
  const [currentList, setCurrentList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [allListnames, setAllListnames] = useState<string[]>();
  const { user } = useUser();

  useEffect(() => {
    easyFetch<{ listname: string }[]>('/api/lists', 'GET', { imdbId })
      .then(data => {
        console.log(user?.unsafeMetadata.defaultListname)
        setLists(data.map(record => record.listname))
        setCurrentList(user?.unsafeMetadata.defaultListname as string | undefined)
      })
    easyFetch<{ listname: string }[]>('/api/lists', 'GET')
      .then(data => setAllListnames(data.map(record => record.listname)));
  }, [refreshTrigger])

  return (
    <form className='flex-1 flex flex-col justify-between gap-4 text-center border-2 p-4'
      onSubmit={e => {
        e.preventDefault();
        easyFetch('/api/lists', 'POST', {
          imdbId,
          listname: currentList || e.currentTarget.newListname.value
        }, true).then(() => setRefreshTrigger(!refreshTrigger));
        e.currentTarget.reset();
      }}
    >
      <h1 className='text-xl'>List Manager</h1>
      {!lists ? <Loading /> : 
        !lists.length ? 'No records found' :
        <div className='flex flex-col gap-4 overflow-y-auto'>
          {lists.map(listname => <span key={listname} className='flex gap-2 justify-center'>
            {listname}
            <Trash2 className='text-red-700 min-h-6 min-w-6'
              onClick={() => {
                easyFetch('/api/lists', 'DELETE', { imdbId, listname }, true)
                  .then(() => setRefreshTrigger(!refreshTrigger))
              }}
            />
          </span>)}
        </div>
      }
      <div className='flex flex-col gap-4'>
        <select className='p-2'
          value={currentList || ''}
          onChange={e => setCurrentList(e.currentTarget.value)}
        >
          <option value=''>Create new list</option>
          {allListnames?.map(listname => <option value={listname} key={listname}>
            {listname}
          </option>)}
        </select>
        {currentList ? [] : 
          <input className='p-2'
            type='text'
            name='newListname'
            placeholder='New listname'
            required
            maxLength={32}
          />
        }
        <button className='colorPrimary' type='submit'>Add to List</button>
      </div>
    </form>
  )
}
