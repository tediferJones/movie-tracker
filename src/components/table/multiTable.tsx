import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo, ListsRes } from '@/types';

export default function MultiTable({ listnames, username }: { listnames: string[], username?: string }) {
  const [currentList, setCurrentList] = useState(listnames[0]);
  const [listData, setListData] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    console.log(listnames, currentList)
    easyFetch<ListsRes>('/api/lists', 'GET', { listname: currentList, username: username })
      .then(data => setListData(data.allMediaInfo || []))
  }, [currentList])

  return !listData ? <Loading /> :
    <div className='showOutline p-2'>
      <ScrollArea type='auto'>
        <div className='max-h-[90vh] m-2 pr-2'>
          <MyTable data={listData}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>{currentList}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56 max-h-[60vh] overflow-auto'>
                <DropdownMenuLabel>Listname</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentList} onValueChange={setCurrentList}>
                  {listnames.map(listname => {
                    return <DropdownMenuRadioItem key={listname} value={listname}>{listname}</DropdownMenuRadioItem>
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </MyTable>
        </div>
      </ScrollArea>
    </div>
}
