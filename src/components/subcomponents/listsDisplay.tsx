import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import easyFetchV3 from '@/lib/easyFetchV3';

export default function ListsDisplay({ username }: { username: string }) {
  const [listnames, setListnames] = useState<string[]>();

  useEffect(() => {
    easyFetchV3<string[]>({
      route: `/api/users/${username}/lists`,
      method: 'GET'
    }).then(data => setListnames(data));
  }, []);

  return (
    <div className='showOutline p-4 flex-1 flex flex-col gap-4 max-h-96 min-w-72'>
      {!listnames ? <Loading /> : 
        <>
          <h3 className='text-center text-xl'>Lists ({listnames.length})</h3>
          <div className='flex flex-col justify-center flex-1 overflow-hidden'>
            <ScrollArea type='auto' className='flex flex-col'>
              {listnames.length === 0
                ? <p className='text-center text-muted-foreground'>No Lists Found</p>
                : listnames.map(listname => (
                  <Link className='block hover:underline hover:bg-secondary p-2 rounded-lg text-center mx-4 truncate'
                    href={`/users/${username}/${listname}`}
                    key={listname}
                  >{listname}</Link>
                ))}
            </ScrollArea>
          </div>
        </>
      }
    </div>
  )
}
