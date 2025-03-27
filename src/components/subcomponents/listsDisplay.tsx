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
    <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
      {!listnames ? <Loading /> : 
        <>
          <h3 className='text-center text-xl'>Lists ({listnames.length})</h3>
          <div className='flex flex-col justify-center flex-1 overflow-clip'>
            <ScrollArea type='auto'>
              <div className='flex flex-col'>
                {listnames.length === 0
                  ? <div className='text-center'>No Lists</div>
                  : listnames.map(listname => (
                    <Link className='hover:underline hover:bg-secondary p-2 rounded-lg text-center mx-4'
                      href={`/users/${username}/${listname}`}
                      key={listname}
                    >{listname}</Link>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </>
      }
    </div>
  )
}
