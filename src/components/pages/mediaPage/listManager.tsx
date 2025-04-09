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

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Loading from '@/components/subcomponents/loading';
import { inputValidation } from '@/lib/inputValidation';
import easyFetchV3 from '@/lib/easyFetchV3';
import ConfirmModal from '@/components/subcomponents/confirmModal';

export default function ListManager({ imdbId }: { imdbId: string }) {
  const illegalListname = 'illegalListname';
  const [matchingLists, setMatchingLists] = useState<string[]>();
  const [currentList, setCurrentList] = useState<string>(illegalListname);
  const [allListnames, setAllListnames] = useState<string[]>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState('');
  const [buttonText, setButtonText] = useState('Waiting...');

  const { user } = useUser();
  useEffect(() => {
    if (!user?.username) return;
    Promise.all([
      easyFetchV3<string[]>({
        route: `/api/users/${user.username}/lists`,
        method: 'GET',
        params: { imdbId },
      }),
      easyFetchV3<string[]>({
        route: `/api/users/${user.username}/lists`,
        method: 'GET'
      }),
      easyFetchV3<string>({
        route: `/api/users/${user.username}/defaultList`,
        method: 'GET'
      })
    ]).then(([ alreadyInLists, listnames, defaultList ]) => {
        setMatchingLists(alreadyInLists);
        const availableLists = listnames.filter(listname => !alreadyInLists.includes(listname));
        setAllListnames(availableLists);
        const autoSelectList = availableLists.includes(defaultList) ? defaultList : availableLists[0];
        setCurrentList(autoSelectList);
        setButtonText('');
      })
  }, [refreshTrigger, user?.username]);

  return (
    <form className='flex flex-col justify-between gap-4 p-4 showOutline flex-1 max-h-96 min-w-72'
      onSubmit={e => {
        e.preventDefault();
        if (!user?.username) return;
        if (buttonText) return console.log('early return');
        const listname = e.currentTarget?.newListname?.value || currentList;
        setButtonText(`Adding to ${listname}...`);
        easyFetchV3({
          route: `/api/users/${user.username}/lists/${listname}`,
          method: 'POST',
          params: { imdbId },
          skipJSON: true,
        }).then(() => setRefreshTrigger(!refreshTrigger));
        e.currentTarget.reset();
      }}
    >
      <h1 className='text-xl text-center'>List Manager</h1>
      {!matchingLists || !user?.username ? <Loading /> : 
        !matchingLists.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
          <ScrollArea type='auto' className='flex flex-col'>
            {matchingLists.map(listname => (
              <span key={listname} className='px-4 flex items-center gap-4'>
                <Link className='flex-1 text-center hover:underline truncate p-2 hover:bg-secondary rounded-lg'
                  href={`/users/${user.username}/${listname}`}
                >{listname}</Link>
                <button type='button'
                  onClick={() => {
                    setConfirmList(listname);
                    setModalVisible(true);
                  }}
                >
                  <span className='sr-only'>Delete from list {listname}</span>
                  <Trash2 className='text-red-700 h-6 w-6' />
                </button>
              </span>
            ))}
          </ScrollArea>
      }
      <div className='flex flex-col gap-4' key={currentList}>
        <Select value={currentList}
          onValueChange={setCurrentList}
          defaultValue={currentList}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder='Select listname'/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={illegalListname}>Create new list</SelectItem>
            {allListnames?.map(listname => (
              <SelectItem key={listname} value={listname}>
                {listname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentList !== illegalListname ? [] : 
          <Input className='p-2'
            type='text'
            name='newListname'
            placeholder='New listname'
            pattern={`^(?!${illegalListname}$).*$`}
            {...inputValidation.listname}
          />
        }
        <Button className='text-wrap' type='submit'>{buttonText || 'Add to List'}</Button>
      </div>
      <ConfirmModal
        visible={modalVisible}
        setVisible={setModalVisible}
        action={() => {
          if (!user?.username) return;
          if (buttonText) return;
          setButtonText(`Deleting from ${confirmList}...`);
          easyFetchV3({
            route: `/api/users/${user.username}/lists/${confirmList}`,
            method: 'DELETE',
            params: { imdbId },
            skipJSON: true,
          }).then(() => setRefreshTrigger(!refreshTrigger));
        }}
      >
        <>
          <p>Are you sure you want to remove this movie from the list:</p>
          <p className='m-auto'>{confirmList}</p>
        </>
      </ConfirmModal>
    </form>
  )
}
