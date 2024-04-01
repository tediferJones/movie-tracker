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
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  const [defaultListname, setDefaultListname] = useState<string>();
  const [existingDefaultList, setExistingDefaultList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    easyFetch<{ listname: string, defaultList: boolean }[]>('/api/listnames', 'GET')
      .then(data => { 
        console.log('all list names', data)
        setListnames(
          data.map(list => {
            if (list.defaultList) setExistingDefaultList(list.listname)
            return list.listname
          })
        )
      });
  }, [refreshTrigger]);

  return !listnames ? <Loading /> :
    <div className='showOutline'>
      <h1>Lists</h1>
      <div className='showOutline'>{listnames.map((listname, i) => (
        <div key={listname} className='flex p-4 gap-4'>
          <span className='w-full'>{listname} {i}</span>
          <ChevronUp onClick={() => {
            // setListnames()
          }}/>
          <ChevronDown />
        </div>
      ))}</div>
    </div>

  // return (
  //   !listnames ? <Loading /> :
  //     <form className='showOutline flex flex-col gap-4 p-4'
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         easyFetch('/api/lists', 'PUT', { listname: defaultListname }, true)
  //           .then(() => setRefreshTrigger(!refreshTrigger));
  //       }}
  //     >
  //       <h3>Set default list</h3>
  //       <div className='text-center'>Default list: {existingDefaultList || 'No default list found'}</div>
  //       <Select value={defaultListname} onValueChange={setDefaultListname}>
  //         <SelectTrigger>
  //           <SelectValue placeholder='New default list'/>
  //         </SelectTrigger>
  //         <SelectContent>
  //           {listnames.map(listname => (
  //             <SelectItem key={listname} value={listname}>
  //               {listname}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //       <Button>Set default list</Button>
  //     </form>
  // )
}
