import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';

import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { watched } from '@/drizzle/schema';
import { useUser } from '@clerk/nextjs';
import Loading from '@/components/subcomponents/loading';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import { formatTimestamp } from '@/lib/formatters';
import easyFetch from '@/lib/easyFetch';

type WatchRecord = typeof watched.$inferSelect

export default function WatchManger({ imdbId }: { imdbId: string }) {
  const [watched, setWatched] = useState<WatchRecord[]>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [record, setRecord] = useState<WatchRecord>();
  const [buttonText, setButtonText] = useState('Waiting...');
  const { user } = useUser();

  useEffect(() => {
    if (user?.username) {
      easyFetch<WatchRecord[]>({
        route: `/api/users/${user.username}/watched`,
        method: 'GET',
        params: { imdbId },
      }).then(data => setWatched(data));
      setButtonText('');
    }
  }, [refreshTrigger, user?.username]);

  return (
    <div className='flex flex-col justify-between gap-4 p-4 text-center showOutline flex-1 max-h-96 min-w-72'>
      <h1 className='text-xl'>Watch Manager</h1>
      {!watched || !user?.username ? <Loading /> : 
        !watched.length ? <p className='text-muted-foreground'>No Watch History Found</p> :
          <div className='flex flex-col overflow-auto'>
            {watched.map(record => {
              return (
                <span key={record.date} className='flex gap-4 items-center justify-center px-4'>
                  <span className='w-full p-2'>
                    {formatTimestamp(record.date)}
                  </span>
                  <button type='button'
                    onClick={() => {
                      setRecord(record);
                      setModalVisible(true);
                    }}
                  >
                    <span className='sr-only'>Delete watch record</span>
                    <Trash2 className='min-h-6 min-w-6 text-red-700' />
                  </button>
                </span>
              )
            })}
          </div>
      }
      <Button onClick={() => {
        if (buttonText) return console.log('BUTTON DISABLED');
        if (user?.username) {
          setButtonText('Adding...');
          easyFetch({
            route: `/api/users/${user.username}/watched`,
            method: 'POST',
            params: { imdbId },
            skipJSON: true,
          }).then(() => {
              setButtonText('');
              setRefreshTrigger(!refreshTrigger);
            });
        }
      }}>{buttonText || 'Add New Record'}</Button>
      <ConfirmModal
        visible={modalVisible}
        setVisible={setModalVisible}
        action={() => {
          if (record) {
            setButtonText('Deleting...');
            easyFetch({
              route: `/api/users/${user?.username}/watched`,
              method: 'DELETE',
              params: { id: record.id, imdbId },
              skipJSON: true,
            }).then(() => {
                setButtonText('');
                setRefreshTrigger(!refreshTrigger);
              });
          }
        }}
      >
        <>
          <p>Are you sure you want to delete this record?</p>
          <p>{formatTimestamp(record?.date || 0)}</p>
        </>
      </ConfirmModal>
    </div>
  )
}
