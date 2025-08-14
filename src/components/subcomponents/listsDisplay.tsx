import Link from 'next/link';
import { useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import useAsyncEffect from '@/hooks/useAsyncEffect';
import easyFetch from '@/lib/easyFetch';
import { Listname } from '@/types';

export default function ListsDisplay({ username }: { username: string }) {
  const [listnames, setListnames] = useState<Listname[]>();

  useAsyncEffect(async () => {
    const listnames = await easyFetch<Listname[]>({
      route: `/api/users/${username}/lists`,
      method: 'GET'
    });
    setListnames(listnames);
  }, []);

  return (
    <div className='showOutline p-4 flex-1 flex flex-col gap-4 max-h-96 min-w-72'>
      {!listnames ? <Loading /> : 
        <>
          <h3 className='text-center text-xl'>Lists ({listnames.length})</h3>
          <div className='flex flex-col overflow-auto'>
            {listnames.length === 0
              ? <p className='text-center text-muted-foreground'>No Lists Found</p>
              : listnames.map(({ listname, id }) => (
                <Link className='hover:underline hover:bg-secondary p-2 mx-4 rounded-lg flex justify-center items-center'
                  href={`/users/${username}/${listname}`}
                  key={`${username}-${id}`}
                >
                  <span className='truncate'>{listname}</span>
                </Link>
              ))}
          </div>
        </>
      }
    </div>
  )
}
