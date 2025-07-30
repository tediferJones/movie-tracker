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
import { Checkbox } from '@/components/ui/checkbox';

import Link from 'next/link';
import { Ellipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import FancyInput from '@/components/subcomponents/fancyInput';
import { inputValidation } from '@/lib/inputValidation';
import { useUserData } from '@/context/userData';
import { listnames } from '@/drizzle/schema';

type Listname = typeof listnames.$inferSelect

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<Listname[]>();
  const [defaultList, setDefaultList] = useState<Listname>();
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState<Listname>();
  const [renameList, setRenameList] = useState('');
  const [newListname, setNewListname] = useState('');
  const [showNewListnameInput, setShowNewListnameInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeout = useRef<NodeJS.Timeout>();

  const userData = useUserData();
  useEffect(() => {
    if (!userData.current) return;
    const listnames = userData.current.getResource('listnames');
    setListnames(listnames);
    setDefaultList(listnames.find(listname => listname.defaultList));
    setButtonText('');
    setConfirmList(undefined);
  }, [userData])

  function resetInput() {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    blurTimeout.current = setTimeout(() => {
      if (!showNewListnameInput) {
        if (renameList) setRenameList('');
        if (newListname) setNewListname('');
      }
    });
  }

  return (
    <div className='showOutline flex flex-col justify-between gap-4 p-4 flex-1 max-h-96 min-w-72'>
      {!listnames || !userData.current ? <Loading /> :
        <>
          <div className='text-center text-xl'>
            Default: {defaultList?.listname || 'No default list found'}
          </div>
          {!listnames.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
            <div className='overflow-auto max-h-fit flex flex-col flex-1'>
              {listnames.map(listname  => (
                <span key={listname.id} className='flex gap-4 justify-center px-4'>
                  <Checkbox className='m-auto'
                    checked={listname.listname === defaultList?.listname}
                    onCheckedChange={async () => {
                      if (buttonText) return;
                      setButtonText(`Setting default to ${listname}...`);
                      if (!userData.current) return;
                      await userData.current.update({
                        params: {
                          listname: listname.listname,
                          set: 'defaultList',
                          val: defaultList?.id ? defaultList.id !== listname.id : true
                        }
                      }, 'PATCH', 'listnames');
                    }}
                  />
                  <Link className='w-full text-center p-2 hover:underline hover:bg-secondary transition-all duration-500 rounded-lg truncate m-auto'
                    href={`/users/${userData.current!.username}/${listname.listname}`}
                  >{listname.listname}</Link>
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
                        setNewListname(listname.listname);
                        setRenameList(listname.listname);
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
            </div>
          }
          <form className='flex flex-col'
            noValidate={!newListname}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!inputRef.current) throw Error('cannot find input ref');
              if (!showNewListnameInput) {
                setShowNewListnameInput(true);
                inputRef.current.focus();
                return;
              }
              if (!userData.current) return;
              if (newListname) {
                if (renameList) {
                  setButtonText(`Renaming ${renameList}...`);
                  const listId = listnames.find(list => list.listname === renameList);
                  if (!listId) throw Error('could not find listId');
                  await userData.current.update({
                    params: { listname: renameList, newListname, id: listId.id }
                  }, 'PUT', 'listnames');
                } else {
                  setButtonText(`Creating ${newListname}...`);
                  await userData.current.update({
                    params: { listname: newListname }
                  }, 'POST', 'listnames');
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
            action={async () => {
              if (buttonText) return;
              if (!confirmList) return;
              if (!userData.current) return;
              setButtonText(`Deleting ${confirmList}...`);
              await userData.current.update({
                params: confirmList 
              }, 'DELETE', 'listnames');
              setConfirmList(undefined);
            }}
          >
            <p>Are you sure you want to delete this list?  All of its contents will be lost.</p>
            <p className='mx-auto'>{confirmList?.listname || 'this is an error'}</p>
          </ConfirmModal>
        </>
      }
    </div>
  )
}
