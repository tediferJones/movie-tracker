import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { watched } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import easyFetchV2 from '@/lib/easyFetchV2';
import { useUser } from '@clerk/nextjs';
import ConfirmModal from '@/components/subcomponents/confirmModal';

type WatchRecord = typeof watched.$inferSelect;

export default function WatchManger({ imdbId }: { imdbId: string }) {
  const [watched, setWatched] = useState<WatchRecord[]>();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [record, setRecord] = useState<WatchRecord>();
  const [buttonText, setButtonText] = useState('Waiting...');
  const { user } = useUser();

  useEffect(() => {
    if (user?.username) {
      easyFetchV2<WatchRecord[]>({
        route: `/api/users/${user.username}/watched`,
        method: 'GET',
        data: { imdbId },
      }).then(data => setWatched(data));
      setButtonText('');
    }
  }, [refreshTrigger, user?.username]);

  function getFormattedDateStr(unixTime: number) {
    const date = new Date(unixTime);
    const dateStr = date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString();
    return `${dateStr} at ${timeStr}`;
  }

  return (
    <div className='flex flex-col justify-between gap-4 p-4 text-center showOutline flex-1 max-h-96 min-w-72'>
      <h1 className='text-xl'>Watch Manager</h1>
      {!watched || !user?.username ? <Loading /> : 
        !watched.length ? <p className='text-muted-foreground'>No Watch History Found</p> :
          <ScrollArea type='auto' className='flex flex-col'>
            {watched.map(record => {
              return (
                <span key={record.date} className='flex gap-4 items-center justify-center px-4'>
                  <span className='w-full p-2'>
                    {getFormattedDateStr(record.date)}
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
          </ScrollArea>
      }
      <Button onClick={() => {
        if (buttonText) return console.log('BUTTON DISABLED');
        if (user?.username) {
          setButtonText('Adding...');
          easyFetchV2({
            route: `/api/users/${user.username}/watched`,
            method: 'POST',
            data: { imdbId },
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
            easyFetchV2({
              route: `/api/users/${user?.username}/watched`,
              method: 'DELETE',
              data: { id: record.id, imdbId },
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
          <p>{getFormattedDateStr(record?.date || 0)}</p>
        </>
      </ConfirmModal>
    </div>
  )
}
