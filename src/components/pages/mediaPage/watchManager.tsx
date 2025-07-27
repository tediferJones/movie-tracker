import { Button } from '@/components/ui/button';

import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { watched } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import { formatTimestamp } from '@/lib/formatters';
import { useUserData } from '@/context/userData';

type WatchRecord = typeof watched.$inferSelect

// FIX ME
// Either rename this to 'watchedManager' or rename 'watchedDisplay' to 'watchDisplay'

export default function WatchManger({ imdbId }: { imdbId: string }) {
  const [watched, setWatched] = useState<WatchRecord[]>();
  const [modalVisible, setModalVisible] = useState(false);
  const [record, setRecord] = useState<WatchRecord>();
  const [buttonText, setButtonText] = useState('Waiting...');

  const userData = useUserData();
  useEffect(() => {
    if (!userData.current) return;
    const watchedRecs = userData.current.getResource('watched').data;
    setWatched(
      watchedRecs
        .filter(watchRec => watchRec.imdbId === imdbId)
        .sort((a, b) => b.date - a.date)
    );
    setButtonText('');
  }, [userData]);

  return (
    <div className='flex flex-col justify-between gap-4 p-4 text-center showOutline flex-1 max-h-96 min-w-72'>
      <h1 className='text-xl'>Watch Manager</h1>
      {!userData.current || !watched ? <Loading /> : 
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
      <Button onClick={async () => {
        if (buttonText) return;
        if (!userData.current) return;
        setButtonText('Adding...');
        await userData.current.update({
          params: { imdbId }
        }, 'POST', 'watched');
      }}>{buttonText || 'Add New Record'}</Button>
      <ConfirmModal
        visible={modalVisible}
        setVisible={setModalVisible}
        action={async () => {
          if (!record) return;
          if (!userData.current) return;
          await userData.current.update({
            params: { id: record.id }
          }, 'DELETE', 'watched');
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
