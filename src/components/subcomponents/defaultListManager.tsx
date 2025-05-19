'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Check, Ellipsis, Menu, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import { Checkbox } from '../ui/checkbox';
import FancyInput from './fancyInput';

export default function DefaultListManager() {
  const [listnames, setListnames] = useState<string[]>();
  // const [newDefaultListname, setNewDefaultListname] = useState<string>();
  const [existingDefaultList, setExistingDefaultList] = useState<string>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState('');
  const [renameList, setRenameList] = useState('');
  const [newListname, setNewListname] = useState('');
  const [showNewListnameInput, setShowNewListnameInput] = useState(false);

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
        setExistingDefaultList(defaultList);
        setButtonText('');
        setConfirmList('');
      })
  }, [refreshTrigger, user?.username]);

  return (
    <div className='showOutline flex flex-col justify-between gap-4 p-4 flex-1 max-h-96 min-w-72'>
      {!listnames || !user?.username ? <Loading /> :
        <>
          <div className='text-center text-xl'>Default: {existingDefaultList || 'No default list found'}</div>
          {!listnames.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
            <ScrollArea type='auto' className='max-h-fit flex flex-col flex-1'>
              {listnames.map(listname => (
                <span key={listname} className='flex gap-4 justify-center px-4'>
                  <Checkbox className='m-auto'
                    checked={listname === existingDefaultList}
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
                  {/*
                  <input type='checkbox'
                    checked={listname === existingDefaultList}
                    onChange={() => {
                      if (listname === existingDefaultList) return console.log('already default list')
                      if (!user?.username) return;
                      if (buttonText) return;
                      setButtonText(`Setting default to ${listname}...`);
                      easyFetchV3({
                        route: `/api/users/${user.username}/defaultList`,
                        method: 'POST',
                        params: { newDefaultListname: listname },
                        skipJSON: true,
                      }).then(() => setRefreshTrigger(!refreshTrigger));
                    }}
                  />
                  */}
                  {renameList === listname ?
                    <FancyInput className='w-full'
                      inputState={[newListname, setNewListname]}
                      notSearch
                      inputProps={{
                        id: `rename-${listname}`,
                        onBlur: () => {
                          console.log('set new listname to', newListname)
                          setButtonText(`Renaming ${listname} to ${newListname}`)
                          easyFetchV3({
                            route: `/api/users/${user.username}/lists/${listname}`,
                            method: 'PUT',
                            body: { newListname },
                            skipJSON: true
                          }).then(() => {
                              setRefreshTrigger(!refreshTrigger);
                              setRenameList('');
                              setNewListname('');
                            })
                        }
                      }}
                    />
                    // <input 
                    //   onChange={(e) => setNewListname(e.currentTarget.value)}
                    //   value={newListname}
                    //   className='w-full m-2 showOutline'
                    //   onBlur={() => {
                    //     console.log('set new listname to', newListname)
                    //     setButtonText(`Renaming ${listname} to ${newListname}`)
                    //     easyFetchV3({
                    //       route: `/api/users/${user.username}/lists/${listname}`,
                    //       method: 'PUT',
                    //       body: { newListname },
                    //       skipJSON: true
                    //     }).then(() => {
                    //         setRefreshTrigger(!refreshTrigger);
                    //         setRenameList('');
                    //         setNewListname('');
                    //       })
                    //   }}
                    // />
                    :
                    <Link className='w-full text-center p-2 hover:underline hover:bg-secondary transition-all duration-300 rounded-lg truncate m-auto'
                      href={`/users/${user.username}/${listname}`}
                    >{listname}</Link>
                  }
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='m-2 p-2 aspect-square'>
                        {/*
                        <Menu />
                        */}
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <button className='w-full' onClick={() => {
                          setRenameList(listname);
                          setNewListname(listname);
                        }}>Rename</button>
                      </DropdownMenuItem>
                      {/*
                      <DropdownMenuItem>
                        <button onClick={() => {
                          if (!user?.username) return;
                          if (buttonText) return;
                          setButtonText(`Setting default to ${listname}...`);
                          easyFetchV3({
                            route: `/api/users/${user.username}/defaultList`,
                            method: 'POST',
                            params: { newDefaultListname: listname },
                            skipJSON: true,
                          }).then(() => setRefreshTrigger(!refreshTrigger));
                        }}>
                          Set as Default
                        </button>
                      </DropdownMenuItem>
                      */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <button className='text-red-500 hover:text-red-500 w-full text-left'
                          onClick={() => {
                            setConfirmList(listname);
                            setModalVisible(true);
                          }}
                        >
                          Delete
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              ))}
            </ScrollArea>
          }
          <div className='flex'>
            {/*
            <input className={`${showNewListnameInput ? 'min-w-full' : 'max-w-0 min-w-0'}`} placeholder='New Listname' />
            <div className={`bg-red-500 h-full transition-all duration-1000 ${showNewListnameInput ? 'max-w-48 min-w-48' : 'max-w-0 min-w-0'}`}></div>
            */}
            <FancyInput className={`overflow-hidden transition-all duration-1000 ${showNewListnameInput ? 'w-full mr-4' : 'w-[0%] px-0 border-none'}`}
              inputState={[newListname, setNewListname]}
              notSearch
              inputProps={{
                autoFocus: showNewListnameInput,
                placeholder: 'New Listname'
              }}
            />
            <Button className={`transition-all duration-1000 w-full ${showNewListnameInput ? 'w-fit' : 'w-full'}`} type='button' onClick={() => {
              console.log('input should appear now')
              console.log('toggle')
              setShowNewListnameInput(!showNewListnameInput);
            }}>{buttonText || 'Create New List'}</Button>
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
    </div>
  )

  // WORKING
  // return (
  //   <form className='showOutline flex flex-col justify-between gap-4 p-4 flex-1 max-h-96 min-w-72'
  //     onSubmit={(e) => {
  //       e.preventDefault();
  //       if (!user?.username) return;
  //       if (buttonText) return;
  //       setButtonText(`Setting default to ${newDefaultListname}...`);
  //       easyFetchV3({
  //         route: `/api/users/${user.username}/defaultList`,
  //         method: 'POST',
  //         params: { newDefaultListname },
  //         skipJSON: true,
  //       }).then(() => setRefreshTrigger(!refreshTrigger));
  //     }}
  //   >
  //     {!listnames || !user?.username? <Loading /> :
  //       <>
  //         <div className='text-center text-xl'>Default: {existingDefaultList || 'No default list found'}</div>
  //         {!listnames.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
  //           <ScrollArea type='auto' className='max-h-fit flex flex-col flex-1'>
  //             {listnames.map(listname => (
  //               <span key={listname} className='flex gap-2 justify-center px-4'>
  //                 <Check className={`m-auto ${existingDefaultList === listname ? 'opacity-100' : 'opacity-0'}`} />
  //                 <Link className='w-full text-center p-2 hover:underline hover:bg-secondary rounded-lg truncate m-auto'
  //                   href={`/users/${user.username}/${listname}`}
  //                 >{listname}</Link>
  //                 {/*
  //                 <DropdownMenu>
  //                   <DropdownMenuTrigger asChild>
  //                     <Button variant='outline' className='m-1 p-2'>
  //                       <Menu />
  //                     </Button>
  //                   </DropdownMenuTrigger>
  //                   <DropdownMenuContent>
  //                     <DropdownMenuLabel>Options</DropdownMenuLabel>
  //                     <DropdownMenuSeparator />
  //                     <DropdownMenuItem asChild>
  //                       <button className='w-full' onClick={() => {
  //                         console.log('rename')
  //                       }}>
  //                         Rename
  //                       </button>
  //                     </DropdownMenuItem>
  //                     <DropdownMenuItem>Set as Default</DropdownMenuItem>
  //                     <DropdownMenuSeparator />
  //                     <DropdownMenuItem>
  //                       <button className='text-red-500 hover:text-red-500 w-full text-left'>
  //                         Delete
  //                       </button>
  //                     </DropdownMenuItem>
  //                   </DropdownMenuContent>
  //                 </DropdownMenu>
  //                 */}
  //                 <button type='button'
  //                   onClick={() => {
  //                     setConfirmList(listname);
  //                     setModalVisible(true);
  //                   }}
  //                 >
  //                   <span className='sr-only'>Delete {listname}</span>
  //                   <Trash2 className='text-red-700 min-h-6 min-w-6' />
  //                 </button>
  //               </span>
  //             ))}
  //           </ScrollArea>
  //         }
  //         <div className='flex flex-col gap-4'>
  //           <Select value={newDefaultListname} onValueChange={setNewDefaultListname}>
  //             <SelectTrigger>
  //               <SelectValue placeholder='New default list'/>
  //             </SelectTrigger>
  //             <SelectContent>
  //               {listnames.map(listname => (
  //                 <SelectItem key={listname} value={listname}>
  //                   {listname}
  //                 </SelectItem>
  //               ))}
  //             </SelectContent>
  //           </Select>
  //           <Button>{buttonText || 'Set default list'}</Button>
  //         </div>
  //         <ConfirmModal
  //           visible={modalVisible}
  //           setVisible={setModalVisible}
  //           action={() => {
  //             if (buttonText) return;
  //             if (!confirmList) return;
  //             setButtonText(`Deleting ${confirmList}...`);
  //             easyFetchV3({
  //               route: `/api/users/${user.username}/lists/${confirmList}`,
  //               method: 'DELETE',
  //             }).then(() => setRefreshTrigger(!refreshTrigger));
  //           }}
  //         >
  //           <p>Are you sure you want to delete this list?  All of its contents will be lost.</p>
  //           <p className='mx-auto'>{confirmList}</p>
  //         </ConfirmModal>
  //       </>
  //     }
  //   </form>
  // )
}
