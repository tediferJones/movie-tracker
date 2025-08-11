import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { useEffect, useRef, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetch from '@/lib/easyFetch';
import { useUserData } from '@/context/userData';
import { ListItem, Listname } from '@/types';

function keepNewest(media: ListItem[]) {
  const deduped = media.reduce((deduped, mediaInfo) => {
    const imdbId = mediaInfo.imdbId;
    if (!deduped[imdbId]) {
      deduped[imdbId] = mediaInfo;
    } else if (deduped[imdbId].dataAdded < mediaInfo.dateAdded) {
      deduped[imdbId] = mediaInfo;
    }
    return deduped;
  }, {} as { [imdbId: string]: ListItem });
  return Object.values(deduped);
}

export default function MultiTable({ username }: { username: string }) {
  const [listData, setListData] = useState<ListItem[]>();
  const [selectedLists, setSelectedLists] = useState<Listname[]>();
  const [allListnames, setAllListnames] = useState<Listname[]>();
  // FIX ME, this just forces re-renders, but there must be a better way to do this
  const [fakeKey, setFakeKey] = useState(0);
  const userData = useUserData();
  useEffect(() => {
    if (userData.current && userData.current.username === username) {
      // use userData to populate lists
      const listnames = userData.current.getResource('listnames');
      setAllListnames(listnames);
      const initialSelect = listnames.find(list => list.defaultList);
      setSelectedLists([ initialSelect || listnames[0] ]);
    } else {
      // fetch list data
      easyFetch<Listname[]>({
        route: `/api/users/${username}/lists`,
        method: 'GET',
      }).then(listnames => {
          // console.log('listnames', listnames)
          setAllListnames(listnames);
          const defaultList = listnames.find(listname => listname.defaultList);
          const autoSelect = defaultList || listnames[0];
          if (autoSelect) setSelectedLists([ autoSelect ]);
        });
    }
  }, [userData]);

  const storedLists = useRef({} as { [listname: string]: ListItem[] })
  useEffect(() => {
    if (!selectedLists?.length) {
      setListData([]);
      return;
    }
    if (userData.current && userData.current.username === username) {
      // console.log(selectedLists)
      const newListData = selectedLists.flatMap(list => {
        if (!userData.current) throw Error('no userData');
        return userData.current.getResource('listContents', list.id);
      })
      // console.log(newListData)
      setListData(keepNewest(newListData));
      setFakeKey(fakeKey + 1);
    } else {
      (async () => {
        const obj: { [listname: string]: ListItem[] } = Object.fromEntries(
          await Promise.all(
            selectedLists.map(async ({ listname, id }) => {
              // console.log(`/api/users/${username}/lists/${listname}`)
              if (storedLists.current[id]) {
                return [ listname, storedLists.current[id] ];
              } else {
                const listContents = await easyFetch<ListItem[]>({
                  route: `/api/users/${username}/lists/${id}`,
                  method: 'GET',
                });
                storedLists.current[id] = listContents;
                return [ listname, listContents ];
              }
            })
          )
        );
        // console.log(obj);
        setListData(keepNewest(Object.values(obj).flat()));
        setFakeKey(fakeKey + 1);
      })();
    }
  }, [selectedLists]);

  // console.log(selectedLists)
  return <div className='showOutline p-4'>
    {!allListnames || !listData ? <Loading /> :
      <MyTable data={listData}
        linkPrefix={
          selectedLists?.length === 1 ?
            `/users/${username}/${selectedLists[0].listname}` :
            '/media'
        }
        useScrollArea={true}
        key={fakeKey}
        listItem
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'
              disabled={!allListnames.length}
              className='w-full sm:w-auto flex gap-1'
            >
              Lists
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='max-h-[60vh] overflow-auto'>
            <DropdownMenuLabel>Listname</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {selectedLists && allListnames?.map(listname => (
              <DropdownMenuCheckboxItem key={`multiTable-listname-${listname.id}`}
                checked={!!selectedLists.includes(listname)}
                onCheckedChange={() => {
                  if (selectedLists.includes(listname)) {
                    setSelectedLists(
                      selectedLists.filter(list => list === listname)
                    );
                  } else {
                    setSelectedLists(selectedLists.concat(listname));
                  }
                }}
              >
                {listname.listname}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </MyTable>
    }
  </div>
}
