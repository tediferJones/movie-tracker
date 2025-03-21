'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';
import ConfirmModal from '@/components/subcomponents/confirmModal';

type AllLists = {
  listnames: string[],
  defaultList: string,
}

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  const [newDefaultListname, setNewDefaultListname] = useState<string>();
  const [existingDefaultList, setExistingDefaultList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState('');

  const { user } = useUser();
  useEffect(() => {
    if (!user?.username) return;
    easyFetchV3<AllLists>({
      route: `/api/users/${user.username}/lists`,
      method: 'GET'
    }).then(data => {
        setListnames(data.listnames);
        setExistingDefaultList(data.defaultList);
        setButtonText('');
        setConfirmList('');
      });
  }, [refreshTrigger, user?.username]);

  // it's not stupid if it works
  setTimeout(() => {
    const container = document.getElementById('scrollAreaChild')?.parentElement
    // @ts-ignore
    if (container) container.style = ''
  }, 100);

  return (
    <form className='showOutline flex flex-col justify-between gap-4 p-4 sm:flex-1 w-full sm:w-auto max-h-[60vh]'
      onSubmit={(e) => {
        e.preventDefault();
        if (!user?.username) return;
        if (buttonText) return;
        setButtonText(`Setting default to ${newDefaultListname}...`);
        easyFetchV3({
          route: `/api/users/${user.username}/lists`,
          method: 'PUT',
          params: { newDefaultListname },
          skipJSON: true,
        }).then(() => setRefreshTrigger(!refreshTrigger));
      }}
    >
      {!listnames || !user?.username? <Loading /> :
        <>
          <div className='text-center text-xl'>Default: {existingDefaultList || 'No default list found'}</div>
          <ScrollArea type='auto' className='max-h-fit'>
            <div id='scrollAreaChild' className='flex flex-col gap-4'>
              {listnames.map(listname => (
                <span key={listname} className='flex gap-2 justify-center px-4'>
                  <Link className='w-full text-center hover:underline truncate'
                    href={`/users/${user.username}/${listname}`}
                  >{listname}</Link>
                  <button type='button'
                    onClick={() => {
                      setConfirmList(listname);
                      setModalVisible(true);
                    }}
                  >
                    <span className='sr-only'>Delete {listname}</span>
                    <Trash2 className='text-red-700 min-h-6 min-w-6' />
                  </button>
                </span>
              ))}
            </div>
          </ScrollArea>
          <div className='flex flex-col gap-4'>
            <Select value={newDefaultListname} onValueChange={setNewDefaultListname}>
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
            <Button>{buttonText || 'Set default list'}</Button>
          </div>
          <ConfirmModal
            visible={modalVisible}
            setVisible={setModalVisible}
            action={() => {
              if (buttonText) return;
              if (!confirmList) return;
              setButtonText(`Deleting ${confirmList}...`);
              easyFetchV3({
                route: `/api/users/${user.username}/lists/${confirmList}`,
                method: 'DELETE',
              }).then(() => setRefreshTrigger(!refreshTrigger));
            }}
          >
            <p>Are you sure you want to delete this list?  All of its contents will be lost.</p>
            <p className='mx-auto'>{confirmList}</p>
          </ConfirmModal>
        </>
      }
    </form>
  )
}
