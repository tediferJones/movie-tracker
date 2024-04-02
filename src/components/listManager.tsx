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

import { useEffect, useState } from 'react'
import easyFetch from '@/lib/easyFetch'
import Loading from '@/components/loading';
import { Trash2 } from 'lucide-react';

export default function ListManager({ imdbId }: { imdbId: string }) {
  const illegalListname = 'illegalListname'
  const [matchingLists, setMatchingLists] = useState<string[]>();
  const [currentList, setCurrentList] = useState<string>(illegalListname);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [allListnames, setAllListnames] = useState<string[]>();

  useEffect(() => {
    // TESTING
    easyFetch<{ listname: string, defaultList: boolean }[]>('/api/lists', 'GET', { imdbId })
      .then(matchingLists => {
        easyFetch<{ listname: string, defaultList: boolean }[]>('/api/listnames', 'GET')
          .then(allLists => {
            const existingListnames = matchingLists.map(list => list.listname);
            const availableListnames = allLists.filter(list => !existingListnames.includes(list.listname)).map(list => list.listname)
            const defaultList = allLists.find(list => list.defaultList)?.listname;
            console.log('existing', existingListnames);
            console.log('available', availableListnames);
            console.log('default list', defaultList)
            setMatchingLists(existingListnames)
            setAllListnames(availableListnames)
            if (defaultList && availableListnames.includes(defaultList)) {
              console.log('setting default list', defaultList)
              setCurrentList(defaultList)
            } else {
              console.log('auto select next list')
              setCurrentList(availableListnames[0] || illegalListname)
            }
          })
      })

    // OLD WORKING
    // easyFetch<{ listname: string, defaultList: boolean }[]>('/api/lists', 'GET', { imdbId })
    //   .then(data => {
    //     console.log('lists for this movie', data)
    //     setMatchingLists(data.map(record => record.listname))
    //   })
    // easyFetch<{ listname: string, defaultList: boolean }[]>('/api/listnames', 'GET')
    //   .then(data => {
    //     console.log('all lists', data)
    //     setAllListnames(
    //       data.map(record => {
    //         if (record.defaultList) setCurrentList(record.listname)
    //         return record.listname
    //       })
    //     )
    //   });
  }, [refreshTrigger])

  return (
    <form className='w-1/2 flex flex-col justify-between gap-4 text-center p-4 showOutline'
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
              {matchingLists.map(listname => <span key={listname} className='flex gap-2 justify-center'>
                {listname}
                <Trash2 className='text-red-700 min-h-6 min-w-6'
                  onClick={() => {
                    easyFetch('/api/lists', 'DELETE', { imdbId, listname }, true)
                      .then(() => setRefreshTrigger(!refreshTrigger))
                  }}
                />
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
            required
            maxLength={32}
          />
        }
        <Button type='submit'>Add to List</Button>
      </div>
    </form>
  )
}
