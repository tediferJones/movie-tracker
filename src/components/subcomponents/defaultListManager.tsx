'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Ellipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import FancyInput from '@/components/subcomponents/fancyInput';
import easyFetchV3 from '@/lib/easyFetchV3';
import { inputValidation } from '@/lib/inputValidation';

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  const [defaultList, setDefaultList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState('');
  const [renameList, setRenameList] = useState('');
  const [newListname, setNewListname] = useState('');
  const [showNewListnameInput, setShowNewListnameInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeout = useRef<NodeJS.Timeout>();

  const { user } = useUser();
  useEffect(() => {
    if (!user?.username) return;
    Promise.all([
      easyFetchV3<string[]>({
        route: `/api/users/${user.username}/lists`,
        method: 'GET',
      }),
      easyFetchV3<string>({
        route: `/api/users/${user.username}/defaultList`,
        method: 'GET',
      })
    ]).then(([ listnames, defaultList ]) => {
        setListnames(listnames);
        setDefaultList(defaultList);
        setButtonText('');
        setConfirmList('');
      })
  }, [refreshTrigger, user?.username]);

  function resetInput() {
    if (blurTimeout.current) {
      console.log('clearing timeout')
      clearTimeout(blurTimeout.current);
    }
    blurTimeout.current = setTimeout(() => {
      if (!showNewListnameInput) {
        if (renameList) {
          console.log('reset renameList')
          setRenameList('');
        }
        if (newListname) {
          console.log('reset newListname')
          setNewListname('');
        }
      }
    });
  }

  return (
    <div className='showOutline flex flex-col justify-between gap-4 p-4 flex-1 max-h-96 min-w-72'>
      {!listnames || !user?.username ? <Loading /> :
        <>
          <div className='text-center text-xl'>Default: {defaultList || 'No default list found'}</div>
          {!listnames.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
            <ScrollArea type='auto' className='max-h-fit flex flex-col flex-1'>
              {listnames.map(listname => (
                <span key={listname} className='flex gap-4 justify-center px-4'>
                  <Checkbox className='m-auto'
                    checked={listname === defaultList}
                    onCheckedChange={(e) => {
                      const newDefaultListname = e ? listname : '';
                      if (!user?.username) return;
                      if (buttonText) return;
                      setButtonText(`Setting default to ${listname}...`);
                      easyFetchV3({
                        route: `/api/users/${user.username}/defaultList`,
                        method: 'POST',
                        params: { newDefaultListname },
                        skipJSON: true,
                      }).then(() => setRefreshTrigger(!refreshTrigger));
                    }}
                  />
                  <Link className='w-full text-center p-2 hover:underline hover:bg-secondary transition-all duration-500 rounded-lg truncate m-auto'
                    href={`/users/${user.username}/${listname}`}
                  >{listname}</Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='m-2 p-2 aspect-square'>
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        setNewListname(listname);
                        setRenameList(listname);
                        setTimeout(() => {
                          if (!inputRef.current) throw Error('cannot find input ref');
                          setShowNewListnameInput(true);
                          inputRef.current.focus();
                        }, 250);
                      }}>Rename</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className='text-red-500 focus:text-red-500'
                        onClick={() => {
                          setConfirmList(listname);
                          setModalVisible(true);
                        }}
                      >Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              ))}
            </ScrollArea>
          }
          <form className='flex flex-col'
            noValidate={!newListname}
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputRef.current) throw Error('cannot find input ref');
              if (!showNewListnameInput) {
                setShowNewListnameInput(true);
                inputRef.current.focus();
                return;
              }
              if (newListname) {
                if (renameList) {
                  setButtonText(`Renaming ${renameList}...`);
                  easyFetchV3({
                    route: `/api/users/${user.username}/lists/${renameList}`,
                    method: 'PUT',
                    body: { newListname },
                    skipJSON: true,
                  }).then(() => setRefreshTrigger(!refreshTrigger));
                } else {
                  setButtonText(`Creating ${newListname}...`);
                  easyFetchV3({
                    route: `/api/users/${user.username}/lists/${newListname}`,
                    method: 'POST',
                    skipJSON: true,
                  }).then(() => setRefreshTrigger(!refreshTrigger));
                }
              }
              setShowNewListnameInput(false);
            }}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowNewListnameInput(false);
              }
            }}
          >
            <FancyInput className={`overflow-hidden transition-all duration-500 ${showNewListnameInput ? 'scale-100 h-10 mb-4' : 'h-0 scale-0 border-none mb-0'}`}
              key={newListname}
              inputState={[newListname, setNewListname]}
              notSearch
              ref={inputRef}
              inputProps={{
                autoFocus: showNewListnameInput,
                placeholder: 'New Listname',
                ...inputValidation.listname,
              }}
              onTransitionEnd={() => resetInput()}
            />
            <Button className='w-full' type='submit'>
              {buttonText ? buttonText :
                renameList && !newListname ? 'Cancel Rename' :
                  renameList ? `Rename ${renameList}` :
                    showNewListnameInput && !newListname ? 'Cancel New List' :
                      'Create New List'
              }
            </Button>
          </form>
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
                skipJSON: true,
              }).then(() => setRefreshTrigger(!refreshTrigger));
              setConfirmList('');
            }}
          >
            <p>Are you sure you want to delete this list?  All of its contents will be lost.</p>
            <p className='mx-auto'>{confirmList}</p>
          </ConfirmModal>
        </>
      }
    </div>
  )
}
