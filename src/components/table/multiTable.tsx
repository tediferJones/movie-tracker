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
import easyFetchV3 from '@/lib/easyFetchV3';
import { ExistingMediaInfo } from '@/types';

export default function MultiTable({
  listnames,
  username,
  defaultListname
}: {
  listnames: string[],
  username: string,
  defaultListname?: string
}) {
  const [currentList, setCurrentList] = useState(defaultListname || listnames[0]);
  const [listData, setListData] = useState<ExistingMediaInfo[]>();

  useEffect(() => {
    easyFetchV3<ExistingMediaInfo[]>({
      route: `/api/users/${username}/lists/${currentList}`,
      method: 'GET'
    }).then(data => setListData(data));
  }, [currentList]);

  return !listData ? <Loading /> :
    <div className='showOutline p-2'>
      <ScrollArea type='auto'>
        <div className='max-h-[90vh] m-2 pr-2'>
          <MyTable data={listData} linkPrefix={`/users/${username}/${currentList}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>{currentList}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56 max-h-[60vh] overflow-auto'>
                <DropdownMenuLabel>Listname</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={currentList} onValueChange={setCurrentList}>
                  {listnames.map(listname => {
                    return <DropdownMenuRadioItem key={listname} value={listname}>
                      {listname}
                    </DropdownMenuRadioItem>
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </MyTable>
        </div>
      </ScrollArea>
    </div>
}
