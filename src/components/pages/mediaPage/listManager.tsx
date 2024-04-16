import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs';
import Loading from '@/components/subcomponents/loading';
import { inputValidation } from '@/lib/inputValidation';
import easyFetch from '@/lib/easyFetch'
import { ListsRes } from '@/types';

export default function ListManager({ imdbId }: { imdbId: string }) {
  const illegalListname = 'illegalListname'
  const username = useUser().user?.username;
  const [matchingLists, setMatchingLists] = useState<string[]>();
  const [currentList, setCurrentList] = useState<string>(illegalListname);
  const [allListnames, setAllListnames] = useState<string[]>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<ListsRes>('/api/lists', 'GET', { imdbId })
      .then(data => {
        const { allListnames, containsImdbId, defaultList } = data
        const availableLists = !containsImdbId || containsImdbId.length === 0 ? allListnames :
          allListnames?.filter(listname => !containsImdbId.includes(listname))
        setMatchingLists(containsImdbId)
        setAllListnames(availableLists)
        if (defaultList && availableLists?.includes(defaultList)) {
          setCurrentList(defaultList)
        }
        setCurrentList(
          defaultList && availableLists?.includes(defaultList) ? defaultList
            : availableLists?.length ? availableLists[0] : illegalListname
        )
      })
  }, [refreshTrigger])

  return (
    <form className='flex flex-col justify-between gap-4 text-center p-4 showOutline sm:flex-1 sm:w-auto w-full max-h-[60vh]'
      onSubmit={e => {
        e.preventDefault();
        easyFetch('/api/lists', 'POST', {
          imdbId,
          listname: e.currentTarget?.newListname?.value || currentList,
        }, true).then(() => setRefreshTrigger(!refreshTrigger));
        e.currentTarget.reset();
      }}
    >
      <h1 className='text-xl'>List Manager</h1>
      {!matchingLists ? <Loading /> : 
        !matchingLists.length ? 'No records found' :
          <ScrollArea type='auto'>
            <div className='flex flex-col gap-4 overflow-y-auto'>
              {matchingLists.map(listname => <span key={listname} className='flex gap-2 justify-center px-4'>
                <Link className='w-full text-center hover:underline'
                  href={`/users/${username}/${listname}`}
                >{listname}</Link>
                <button type='button'
                  onClick={() => {
                    easyFetch('/api/lists', 'DELETE', { imdbId, listname }, true)
                      .then(() => setRefreshTrigger(!refreshTrigger))
                  }}
                >
                  <Trash2 className='text-red-700 min-h-6 min-w-6' />
                </button>
              </span>)}
            </div>
          </ScrollArea>
      }
      <div className='flex flex-col gap-4'>
        <Select value={currentList} onValueChange={setCurrentList}>
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
            {...inputValidation.listname}
          />
        }
        <Button type='submit'>Add to List</Button>
      </div>
    </form>
  )
}
