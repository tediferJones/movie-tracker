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

import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetchV3 from '@/lib/easyFetchV3';
import { ExistingMediaInfo } from '@/types';

export default function MultiTable({ username }: { username: string }) {
  const [listData, setListData] = useState<ExistingMediaInfo[]>();
  const [currentList, setCurrentList] = useState<string>();
  const [listnames, setListnames] = useState<string[]>();

  useEffect(() => {
    if (!listnames) {
      Promise.all([
        easyFetchV3<string[]>({
          route: `/api/users/${username}/lists`,
          method: 'GET',
        }),
        easyFetchV3<string>({
          route: `/api/users/${username}/defaultList`,
          method: 'GET',
        }),
      ]).then(([listnames, defaultList]) => {
          setListnames(listnames);
          setCurrentList(defaultList || listnames[0]);
          if (!listnames.length) setListData([]);
        });
    } else {
      easyFetchV3<ExistingMediaInfo[]>({
        route: `/api/users/${username}/lists/${currentList}`,
        method: 'GET',
      }).then(data => setListData(data || []));
    }
  }, [currentList]);

  return <div className='showOutline p-2'>
    {!listnames || !listData ? <Loading /> :
      <MyTable data={listData}
        linkPrefix={`/users/${username}/${currentList}`}
        useScrollArea={true}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'
              disabled={!currentList}
              className='w-full sm:w-auto flex gap-1'
            >
              {!currentList ? <span>No Lists Found</span> : <>
                <span>List:</span>
                <span className='truncate'>{currentList}</span>
              </>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='max-h-[60vh] overflow-auto'>
            <DropdownMenuLabel>Listname</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={currentList} onValueChange={setCurrentList}>
              {listnames.map(listname => (
                <DropdownMenuRadioItem key={listname} value={listname}>
                  {listname}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </MyTable>
    }
  </div>
}
