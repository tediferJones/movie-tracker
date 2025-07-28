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
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';
import { useUserData } from '@/context/userData';
import { listnames } from '@/drizzle/schema';

type Listname = typeof listnames.$inferSelect;

export default function MultiTable({ username }: { username: string }) {
  // const [listData, setListData] = useState<ExistingMediaInfo[]>();
  // const [currentList, setCurrentList] = useState<string>();
  // const [listnames, setListnames] = useState<string[]>();
  // const [fakeKey, setFakeKey] = useState(0);

  // useEffect(() => {
  //   if (!listnames) {
  //     Promise.all([
  //       easyFetch<string[]>({
  //         route: `/api/users/${username}/lists`,
  //         method: 'GET',
  //       }),
  //       easyFetch<string>({
  //         route: `/api/users/${username}/defaultList`,
  //         method: 'GET',
  //       }),
  //     ]).then(([listnames, defaultList]) => {
  //         console.log({ listnames, defaultList })
  //         setListnames(listnames);
  //         setCurrentList(defaultList || listnames[0]);
  //         if (!listnames.length) setListData([]);
  //       });
  //   } else {
  //     easyFetch<ExistingMediaInfo[]>({
  //       route: `/api/users/${username}/lists/${currentList}`,
  //       method: 'GET',
  //     }).then(data => {
  //         setListData(data || [])
  //         setFakeKey(fakeKey + 1)
  //       });
  //   }
  // }, [currentList]);

  const [listData, setListData] = useState<ExistingMediaInfo[]>();
  const [selectedLists, setSelectedLists] = useState<Listname[]>([]);
  const [allListnames, setAllListnames] = useState<Listname[]>();
  const [fakeKey, setFakeKey] = useState(0);
  const userData = useUserData();
  useEffect(() => {
    if (userData.current && userData.current.username === username) {
      // use userData to populate lists
      const listnames = userData.current.getResource('listnames').data;
      setAllListnames(listnames);
      const initialSelect = listnames.find(list => list.defaultList);
      setSelectedLists([ initialSelect || listnames[0] ]);
    } else {
      // fetch list data
    }
  }, [userData]);

  useEffect(() => {
    console.log('load table data')
    // if (userData.current && userData.current.username === username) {
    //   const newListData = selectedLists.flatMap(list => {
    //     if (!userData.current) throw Error('no userData');
    //     return userData.current.getResource('listContents').data[list.id];
    //   })

    //   setListData(newListData.sort((a, b) => a.date - b.date))
    // }
  }, [selectedLists]);

  return <div className='showOutline p-4'>
    {!allListnames || !listData || !selectedLists ? <Loading /> :
      <MyTable data={listData}
        linkPrefix={`/users/${username}/${selectedLists[0].listname}`}
        useScrollArea={true}
        key={fakeKey}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'
              disabled={!allListnames.length}
              className='w-full sm:w-auto flex gap-1'
            >
              Lists
              {/*
              {!allListnames.length ? <span>No Lists Found</span> : <>
                <span>List:</span>
                <span className='truncate'>{currentList}</span>
              </>}
              */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='max-h-[60vh] overflow-auto'>
            <DropdownMenuLabel>Listname</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/*
            <DropdownMenuRadioGroup value={currentList} onValueChange={setCurrentList}>
              {listnames.map(listname => (
                <DropdownMenuRadioItem key={listname} value={listname}>
                  {listname}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            */}
          </DropdownMenuContent>
        </DropdownMenu>
      </MyTable>
    }
  </div>
}
