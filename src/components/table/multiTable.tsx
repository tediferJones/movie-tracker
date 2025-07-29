import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { useEffect, useRef, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import MyTable from '@/components/table/myTable';
import easyFetch from '@/lib/easyFetch';
import { ExistingMediaInfo } from '@/types';
import { useUserData } from '@/context/userData';
import { listnames } from '@/drizzle/schema';
import { ListItem } from '@/lib/hashCacheV5';

type Listname = typeof listnames.$inferSelect;

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

  const [listData, setListData] = useState<ListItem[]>();
  const [selectedLists, setSelectedLists] = useState<Listname[]>([]);
  const [allListnames, setAllListnames] = useState<Listname[]>();
  // FIX ME, this just forces re-renders, but there must be a better way to do this
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
      // listnames will actually be strings until API route is fixed
      easyFetch<Listname[]>({
        route: `/api/users/${username}/lists`,
        method: 'GET',
      }).then(listnames => {
          setAllListnames(listnames);
          const defaultList = listnames.find(listname => listname.defaultList);
          setSelectedLists([ defaultList || listnames[0] ]);
        });
    }
  }, [userData]);

  const storedLists = useRef({} as { [listname: string]: ListItem[] })
  useEffect(() => {
    console.log('load table data')
    if (userData.current && userData.current.username === username) {
      console.log(selectedLists)
      const newListData = selectedLists.flatMap(list => {
        if (!userData.current) throw Error('no userData');
        // @ts-ignore, technically this a DataCache<Resource> not just a Resource
        return userData.current.getResource('listContents')[list.id].data;
      })
      console.log(newListData)
      setListData(keepNewest(newListData));
      setFakeKey(fakeKey + 1);
    } else {
      // this is still using the old API route that just returns listnames
      // it will need to be adjusted to use full listname records
      (async () => {
        const obj: { [listname: string]: ListItem[] } = Object.fromEntries(
          await Promise.all(
            selectedLists.map(async listname => {
              console.log(`/api/users/${username}/lists/${listname}`)
              const listnameV2 = listname as any as string;
              if (storedLists.current[listnameV2]) {
                return [
                  listname,
                  storedLists.current[listnameV2] as ListItem[]
                ];
              } else {
                const listContents = await easyFetch<ListItem[]>({
                  route: `/api/users/${username}/lists/${listname}`,
                  method: 'GET',
                })
                storedLists.current[listnameV2] = listContents;
                return [
                  listname,
                  listContents
                ];
              }
            })
          )
        );
        setListData(keepNewest(Object.values(obj).flat()));
        setFakeKey(fakeKey + 1);
      })();
    }
  }, [selectedLists]);

  return <div className='showOutline p-4'>
    {!allListnames || !listData || !selectedLists ? <Loading /> :
      <MyTable data={listData}
        linkPrefix={`/users/${username}/${selectedLists[0].listname}`}
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
            {allListnames.map(listname => (
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
