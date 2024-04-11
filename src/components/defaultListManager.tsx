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

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  const [defaultListname, setDefaultListname] = useState<string>();
  const [existingDefaultList, setExistingDefaultList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<ListsRes>('/api/lists', 'GET')
      .then(data => {
        console.log(data)
        setListnames(data.allListnames)
        setExistingDefaultList(data.defaultList)
      })
  }, [refreshTrigger]);

  return (
    !listnames ? <Loading /> :
      <form className='showOutline flex flex-col gap-4 p-4'
        onSubmit={(e) => {
          e.preventDefault();
          easyFetch('/api/lists', 'PUT', { listname: defaultListname }, true)
            .then(() => setRefreshTrigger(!refreshTrigger));
        }}
      >
        <h3>Set default list</h3>
        <div className='text-center'>Default list: {existingDefaultList || 'No default list found'}</div>
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
