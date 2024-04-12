'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useEffect, useState } from 'react'
import Loading from '@/components/loading';
import easyFetch from '@/lib/easyFetch'
import { ListsRes } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  const [defaultListname, setDefaultListname] = useState<string>();
  const [existingDefaultList, setExistingDefaultList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const username = useUser().user?.username;

  useEffect(() => {
    easyFetch<ListsRes>('/api/lists', 'GET')
      .then(data => {
        console.log('defaultListManager', data)
        setListnames(data.allListnames)
        setExistingDefaultList(data.defaultList)
      })
  }, [refreshTrigger]);

  return (
    !listnames ? <Loading /> :
      <form className='showOutline flex flex-col justify-between gap-4 p-4 sm:flex-1 w-full sm:w-auto max-h-[60vh]'
        onSubmit={(e) => {
          e.preventDefault();
          easyFetch('/api/lists', 'PUT', { listname: defaultListname }, true)
            .then(() => setRefreshTrigger(!refreshTrigger));
        }}
      >
        <div className='text-center text-xl'>Default: {existingDefaultList || 'No default list found'}</div>
        <ScrollArea type='auto' className='max-h-fit'>
          <div className='flex flex-col gap-4'>
            {listnames.map(listname => <span key={listname} className='flex gap-2 justify-center px-4'>
              <Link className='w-full text-center hover:underline'
                href={`/users/${username}/${listname}`}
              >{listname}</Link>
              <button type='button'
                onClick={() => {
                  easyFetch('/api/lists', 'DELETE', { listname }, true)
                    .then(() => setRefreshTrigger(!refreshTrigger))
                }}
              >
                <Trash2 className='text-red-700 min-h-6 min-w-6' />
              </button>
            </span>)}
          </div>
        </ScrollArea>
        <Select value={defaultListname} onValueChange={setDefaultListname}>
          <SelectTrigger>
            <SelectValue placeholder='New default list'/>
          </SelectTrigger>
          <SelectContent>
            {listnames.map(listname => (
              <SelectItem key={listname} value={listname}>
                {listname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button>Set default list</Button>
      </form>
  )
}
