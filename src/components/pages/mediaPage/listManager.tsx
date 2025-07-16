import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';

import Link from 'next/link';
import { ChevronUp, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs';
import Loading from '@/components/subcomponents/loading';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import { inputValidation } from '@/lib/inputValidation';
import easyFetch from '@/lib/easyFetch';
import { useUserData } from '@/context/userData';
import { listnames } from '@/drizzle/schema';

type Listname = typeof listnames.$inferSelect;

export default function ListManager({ imdbId }: { imdbId: string }) {
  const illegalListname = 'illegalListname';
  const [matchingLists, setMatchingLists] = useState<Listname[]>();
  const [currentList, setCurrentList] = useState<string>(illegalListname);
  const [allListnames, setAllListnames] = useState<Listname[]>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState('');
  const [buttonText, setButtonText] = useState('Waiting...');

  // function getListId(listname: string) {
  //   return userData.current?.resources.listnames.find(
  //     list => list.listname === listname
  //   );
  // }
  const userData = useUserData();
  useEffect(() => {
    console.log('USER DATA HAS CHANGED', userData)
    if (!userData.current) return console.log('no userData');
    const listContents = userData.current.resources['listContents'];
    const listnames = userData.current.resources['listnames'];
    const alreadyInLists = Object.keys(listContents).filter(key => {
      return listContents[key].find(mediaInfo => mediaInfo.imdbId === imdbId);
    }).map(key => {
      const listname = listnames.find(listname => listname.id === Number(key));
      if (!listname) throw Error('this should not even be possible');
      return listname;
    });
    setMatchingLists(alreadyInLists);
    const matchingListIds = alreadyInLists.map(list => list.id);
    const availableLists = listnames.filter(list => !matchingListIds.includes(list.id))
    setAllListnames(availableLists);
    const defaultList = availableLists.find(list => list.defaultList)?.listname;
    setCurrentList(defaultList || availableLists[0].listname);
    console.log('HASHCACHE', { alreadyInLists, availableLists })
    setButtonText('');
  }, [userData]);

  // console.log(userData)
  // const lists = userData.current?.resources['listContents']

  return (
    <form className='flex flex-col justify-between gap-4 p-4 showOutline flex-1 max-h-96 min-w-72'
      onSubmit={async e => {
        e.preventDefault();
        if (!userData.current) return;
        // this is needed for creating new lists
        const listname = e.currentTarget?.newListname?.value || currentList;
        if (!allListnames) throw Error('No listnames');
        const list = allListnames.find(list => list.listname === listname);
        if (!list) throw Error(`No listId for ${currentList}`);
        await userData.current.updateResource('listContents', 'POST', {
          imdbId,
          listId: list.id,
          listname: listname,
        }, list.id.toString());
        // WHAT DOES THIS DO
        // e.currentTarget.reset();
      }}
    >
      <h1 className='text-xl text-center'>List Manager</h1>
      {!userData.current || !matchingLists ? <Loading /> : 
        !matchingLists.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
          <div className='flex flex-col overflow-auto'>
            {matchingLists.map(({ listname, id }) => (
              <span key={id} className='px-4 flex items-center gap-4 py-1'>
                <button className='relative hover:ring-ring hover:ring-2 rounded-lg p-2'
                  type='button'
                  onClick={() => {
                    console.log(`bumping ${imdbId} in ${listname}`)
                    setButtonText(`Bumping ${listname}...`);
                    easyFetch({
                      route: `/api/users/${userData.current!.username}/lists/${listname}`,
                      method: 'PATCH',
                      params: { imdbId },
                      skipJSON: true,
                    }).then(() => setRefreshTrigger(!refreshTrigger));
                  }}
                >
                  <span className='sr-only'>Bump {listname}</span>
                  <ChevronUp className='h-6 w-6' />
                </button>
                <Link className='flex-1 text-center hover:underline truncate p-2 hover:bg-secondary rounded-lg transition-all duration-300'
                  href={`/users/${userData.current!.username}/${listname}`}
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
          </div>
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
            {allListnames?.map(({ listname, id }) => (
              <SelectItem key={id} value={listname}>
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
          if (!userData.current?.username) return;
          if (buttonText) return;
          setButtonText(`Deleting from ${confirmList}...`);
          easyFetch({
            route: `/api/users/${userData.current.username}/lists/${confirmList}`,
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

// OLD VERSION WITHOUT HASHCACHE
// export default function ListManager({ imdbId }: { imdbId: string }) {
//   const illegalListname = 'illegalListname';
//   const [matchingLists, setMatchingLists] = useState<string[]>();
//   const [currentList, setCurrentList] = useState<string>(illegalListname);
//   const [allListnames, setAllListnames] = useState<string[]>();
//   const [refreshTrigger, setRefreshTrigger] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [confirmList, setConfirmList] = useState('');
//   const [buttonText, setButtonText] = useState('Waiting...');
// 
//   const { user } = useUser();
//   useEffect(() => {
//     if (!user?.username) return;
//     Promise.all([
//       easyFetch<string[]>({
//         route: `/api/users/${user.username}/lists`,
//         method: 'GET',
//         params: { imdbId },
//       }),
//       easyFetch<string[]>({
//         route: `/api/users/${user.username}/lists`,
//         method: 'GET'
//       }),
//       easyFetch<string>({
//         route: `/api/users/${user.username}/defaultList`,
//         method: 'GET'
//       })
//     ]).then(([ alreadyInLists, listnames, defaultList ]) => {
//         setMatchingLists(alreadyInLists);
//         const availableLists = listnames.filter(listname => !alreadyInLists.includes(listname));
//         setAllListnames(availableLists);
//         const autoSelectList = availableLists.includes(defaultList) ? defaultList : availableLists[0];
//         setCurrentList(autoSelectList);
//         setButtonText('');
//       })
//   }, [refreshTrigger, user?.username]);
// 
//   return (
//     <form className='flex flex-col justify-between gap-4 p-4 showOutline flex-1 max-h-96 min-w-72'
//       onSubmit={async e => {
//         e.preventDefault();
//         if (!user?.username) return;
//         if (buttonText) return console.log('early return');
//         const listname = e.currentTarget?.newListname?.value || currentList;
//         setButtonText(`Adding to ${listname}...`);
//         easyFetch({
//           route: `/api/users/${user.username}/lists/${listname}`,
//           method: 'POST',
//           params: { imdbId },
//           skipJSON: true,
//         }).then(() => setRefreshTrigger(!refreshTrigger));
//         e.currentTarget.reset();
//       }}
//     >
//       <h1 className='text-xl text-center'>List Manager</h1>
//       {!matchingLists || !user?.username ? <Loading /> : 
//         !matchingLists.length ? <p className='text-center text-muted-foreground'>No Lists Found</p> :
//           <div className='flex flex-col overflow-auto'>
//             {matchingLists.map(listname => (
//               <span key={listname} className='px-4 flex items-center gap-4 py-1'>
//                 <button className='relative hover:ring-ring hover:ring-2 rounded-lg p-2'
//                   type='button'
//                   onClick={() => {
//                     console.log(`bumping ${imdbId} in ${listname}`)
//                     setButtonText(`Bumping ${listname}...`);
//                     easyFetch({
//                       route: `/api/users/${user.username}/lists/${listname}`,
//                       method: 'PATCH',
//                       params: { imdbId },
//                       skipJSON: true,
//                     }).then(() => setRefreshTrigger(!refreshTrigger));
//                   }}
//                 >
//                   <span className='sr-only'>Bump {listname}</span>
//                   <ChevronUp className='h-6 w-6' />
//                 </button>
//                 <Link className='flex-1 text-center hover:underline truncate p-2 hover:bg-secondary rounded-lg transition-all duration-300'
//                   href={`/users/${user.username}/${listname}`}
//                 >{listname}</Link>
//                 <button type='button'
//                   onClick={() => {
//                     setConfirmList(listname);
//                     setModalVisible(true);
//                   }}
//                 >
//                   <span className='sr-only'>Delete from list {listname}</span>
//                   <Trash2 className='text-red-700 h-6 w-6' />
//                 </button>
//               </span>
//             ))}
//           </div>
//       }
//       <div className='flex flex-col gap-4' key={currentList}>
//         <Select value={currentList}
//           onValueChange={setCurrentList}
//           defaultValue={currentList}
//           required
//         >
//           <SelectTrigger>
//             <SelectValue placeholder='Select listname'/>
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value={illegalListname}>Create new list</SelectItem>
//             {allListnames?.map(listname => (
//               <SelectItem key={listname} value={listname}>
//                 {listname}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {currentList !== illegalListname ? [] : 
//           <Input className='p-2'
//             type='text'
//             name='newListname'
//             placeholder='New listname'
//             pattern={`^(?!${illegalListname}$).*$`}
//             {...inputValidation.listname}
//           />
//         }
//         <Button className='text-wrap' type='submit'>{buttonText || 'Add to List'}</Button>
//       </div>
//       <ConfirmModal
//         visible={modalVisible}
//         setVisible={setModalVisible}
//         action={() => {
//           if (!user?.username) return;
//           if (buttonText) return;
//           setButtonText(`Deleting from ${confirmList}...`);
//           easyFetch({
//             route: `/api/users/${user.username}/lists/${confirmList}`,
//             method: 'DELETE',
//             params: { imdbId },
//             skipJSON: true,
//           }).then(() => setRefreshTrigger(!refreshTrigger));
//         }}
//       >
//         <>
//           <p>Are you sure you want to remove this movie from the list:</p>
//           <p className='m-auto'>{confirmList}</p>
//         </>
//       </ConfirmModal>
//     </form>
//   )
// }
