import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const illegalListname = 'illegalListname'

  useEffect(() => {
    easyFetch<{ listname: string }[]>('/api/lists', 'GET', { imdbId })
      .then(data => {
        console.log(user?.unsafeMetadata.defaultListname)
        setLists(data.map(record => record.listname))
        // setCurrentList('list5' || user?.unsafeMetadata.defaultListname as string | undefined)
        setCurrentList('list5')
      })
    easyFetch<{ listname: string }[]>('/api/lists', 'GET')
      .then(data => setAllListnames(data.map(record => record.listname)));
  }, [refreshTrigger])

  return (
    <form className='w-1/2 flex flex-col justify-between gap-4 text-center p-4 showOutline'
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
        <Select value={currentList} onValueChange={(val) => setCurrentList(val)}>
          <SelectTrigger>
            <SelectValue placeholder='Select listname'/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={illegalListname}>Create new list</SelectItem>
            {allListnames?.map(listname => <SelectItem
              key={listname}
              value={listname}
            >{listname}</SelectItem>)}
          </SelectContent>
        </Select>
        {currentList !== illegalListname ? [] : 
          <Input className='p-2'
            type='text'
            name='newListname'
            placeholder='New listname'
            pattern={`^(?!${illegalListname}$).*$`}
            required
            maxLength={32}
          />
        }
        <Button type='submit'>Add to List</Button>
      </div>
    </form>
  )
}
