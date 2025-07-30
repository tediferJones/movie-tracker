import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import Link from 'next/link';
import { ChevronUp, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import { inputValidation } from '@/lib/inputValidation';
// import easyFetch from '@/lib/easyFetch';
import { useUserData } from '@/context/userData';
import { listnames } from '@/drizzle/schema';

type Listname = typeof listnames.$inferSelect;

export default function ListManager({ imdbId }: { imdbId: string }) {
  const illegalListname = 'illegalListname';
  const [matchingLists, setMatchingLists] = useState<Listname[]>();
  const [currentList, setCurrentList] = useState<string>(illegalListname);
  const [allListnames, setAllListnames] = useState<Listname[]>();
  // const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmList, setConfirmList] = useState('');
  const [buttonText, setButtonText] = useState('Waiting...');

  const userData = useUserData();
  useEffect(() => {
    if (!userData.current) return console.log('no current');
    if (!userData.current.isSynced) return console.log('out of sync');
    const listnames = userData.current.getResource('listnames');

    const { included, excluded } = listnames.reduce((obj, listname) => {
      if (!userData.current) throw Error('Cannot find userData');
      const found = userData.current.getResource('listContents', listname.id);
      obj[found ? 'included' : 'excluded'].push(listname);
      return obj;
    }, { included: [] as Listname[], excluded: [] as Listname[] });

    setMatchingLists(included); // already contains imdbId
    setAllListnames(excluded); // available lists
    const defaultList = excluded.find(list => list.defaultList);
    setCurrentList(
      defaultList?.listname || excluded[0]?.listname || illegalListname
    ); // listname of currently selected
    setButtonText('');
  }, [userData]);

  return (
    <form className='flex flex-col justify-between gap-4 p-4 showOutline flex-1 max-h-96 min-w-72'
      onSubmit={async e => {
        e.preventDefault();
        if (buttonText) return;
        if (!userData.current) return;
        // this is needed for creating new lists
        const listname = e.currentTarget?.newListname?.value || currentList;
        if (!allListnames) throw Error('No listnames');
        const list = allListnames.find(list => list.listname === listname);
        if (!list) throw Error(`No listId for ${currentList}`);
        await userData.current.update({
          params: { listname, listId: list.id, imdbId }
        }, 'POST', 'listContents', list.id);
        // FIX ME
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
                    if (buttonText) return;
                    console.log(`bumping ${imdbId} in ${listname}`)
                    setButtonText(`Bumping ${listname}...`);
                    if (!userData.current) return;
                    userData.current.update({
                      params: { imdbId }
                    }, 'PATCH', 'listContents');
                    // easyFetch({
                    //   route: `/api/users/${userData.current!.username}/lists/${listname}`,
                    //   method: 'PATCH',
                    //   params: { imdbId },
                    //   skipJSON: true,
                    // }).then(() => setRefreshTrigger(!refreshTrigger));
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
        action={async () => {
          if (!userData.current?.username) return;
          if (buttonText) return;
          setButtonText(`Deleting from ${confirmList}...`);
          const list = matchingLists?.find(list => list.listname === confirmList);
          if (!list) throw Error('could not find listId')
          console.log('DELETE THIS', { listname: confirmList, imdbId, listId: list.id })
          await userData.current.update({
            params: { listname: confirmList, imdbId, listId: list.id }
          }, 'DELETE', 'listContents', list.id);
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
