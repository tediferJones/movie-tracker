'use client';

import { ScrollArea } from '@/components/ui/scroll-area';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import ReviewsDisplay from '@/components/subcomponents/reviewsDisplay';
import MultiTable from '@/components/table/multiTable';
import easyFetch from '@/lib/easyFetch';
import { UserRes } from '@/types';
// import easyFetchV3 from '@/lib/easyFetchV3';
// import { reviews, watched } from '@/drizzle/schema';
// 
// type WatchedRec = typeof watched.$inferSelect
// type ReviewRec = typeof reviews.$inferSelect
// type AllLists = {
//   listnames: string[],
//   defaultList: string,
// }

export default function UserPage({ username, children }: { username: string, children?: ReactNode }) {
  // const [watched, setWatched] = useState<WatchedRec[]>();
  // const [lists, setLists] = useState<AllLists['listnames']>();
  // const [reviews, setReviews] = useState<ReviewRec[]>();
  // const [user, setUser] = useState(false);

  // useEffect(() => {
  //   easyFetchV3<WatchedRec[]>({
  //     route: `/api/users/${username}/watched`,
  //     method: 'GET',
  //   }).then(watched => setWatched(watched));
  //   easyFetchV3<AllLists>({
  //     route: `/api/users/${username}/lists`,
  //     method: 'GET',
  //   }).then(lists => setLists(lists.listnames));
  //   easyFetchV3<ReviewRec[]>({
  //     route: `/api/users/${username}/reviews`,
  //     method: 'GET',
  //   }).then(reviews => setReviews(reviews));
  // }, [])

  // return <div className='flex flex-col gap-4'>
  //   <div className='flex flex-wrap gap-4'>
  //     <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
  //       {!watched ? <Loading /> :
  //         <>
  //           <h3 className='text-center text-xl'>Recently watched ({watched.length})</h3>
  //           <div className='h-full flex flex-col justify-center overflow-hidden'>
  //             <ScrollArea type='auto'>
  //               <div className='text-center flex flex-col gap-4'>
  //                 {watched.length === 0
  //                   ? <div className='text-center'>No watch records found</div>
  //                   : watched.map(watchRec => (
  //                     <div className='flex flex-wrap mx-4 justify-between' key={`${watchRec.imdbId}-${watchRec.date}`}>
  //                       <Link className='hover:underline flex-1'
  //                         href={`/media/${watchRec.imdbId}`}
  //                       >{watchRec.title || 'title lookup'}</Link>
  //                       <span className='w-full text-center'>{new Date(watchRec.date).toLocaleTimeString(undefined, {
  //                         year: 'numeric',
  //                         month: 'long',
  //                         day: 'numeric',
  //                       })}</span>
  //                     </div>
  //                   ))}
  //               </div>
  //             </ScrollArea>
  //           </div>

  //         </>
  //       }
  //     </div>

  //       {children ? children : 
  //         <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
  //           <h3 className='text-center text-xl'>Lists ({user.listnames.length})</h3>
  //           <div className='flex flex-col justify-center flex-1'>
  //             <ScrollArea type='auto'>
  //               <div className='flex flex-col gap-4'>
  //                 {user.listnames.length === 0
  //                   ? <div className='text-center'>No Lists</div>
  //                   : user.listnames.map(listname => (
  //                     <Link className='hover:underline hover:bg-secondary p-2 rounded-lg text-center mx-4'
  //                       href={`/users/${username}/${listname}`}
  //                       key={listname}
  //                     >{listname}</Link>
  //                   ))}
  //               </div>
  //             </ScrollArea>
  //           </div>
  //         </div>
  //       }
  //     </div>
  //     {user.listnames.length === 0 ? [] :
  //       <MultiTable username={username}
  //         listnames={user.listnames}
  //         defaultListname={user.defaultList}
  //       />
  //     }
  //     <h3 className='text-xl px-4'>All Reviews</h3>
  //     <ReviewsDisplay reviews={user.reviews} />
  //   </div>

  // OLD WORKING
  const [user, setUser] = useState<UserRes>();

  useEffect(() => {
    easyFetch<UserRes>('/api/users', 'GET', { username })
      .then(data => setUser(data))
  }, [])

  return !user ? <Loading /> :
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-4'>
        <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
          <h3 className='text-center text-xl'>Recently watched ({user.watched.length})</h3>
          <div className='h-full flex flex-col justify-center overflow-hidden'>
            <ScrollArea type='auto'>
              <div className='text-center flex flex-col gap-4'>
                {user.watched.length === 0
                  ? <div className='text-center'>No watch records found</div>
                  : user.watched.map(watchRec => (
                    <div className='flex flex-wrap mx-4 justify-between' key={`${watchRec.imdbId}-${watchRec.date}`}>
                      <Link className='hover:underline flex-1'
                        href={`/media/${watchRec.imdbId}`}
                      >{watchRec.title}</Link>
                      <span className='w-full text-center'>{new Date(watchRec.date).toLocaleTimeString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {children ? children : 
          <div className='showOutline p-4 sm:flex-1 w-full sm:w-auto flex flex-col gap-4 max-h-[60vh]'>
            <h3 className='text-center text-xl'>Lists ({user.listnames.length})</h3>
            <div className='flex flex-col justify-center flex-1'>
              <ScrollArea type='auto'>
                <div className='flex flex-col gap-4'>
                  {user.listnames.length === 0
                    ? <div className='text-center'>No Lists</div>
                    : user.listnames.map(listname => (
                      <Link className='hover:underline hover:bg-secondary p-2 rounded-lg text-center mx-4'
                        href={`/users/${username}/${listname}`}
                        key={listname}
                      >{listname}</Link>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        }
      </div>
      {user.listnames.length === 0 ? [] :
        <MultiTable username={username}
          listnames={user.listnames}
          defaultListname={user.defaultList}
        />
      }
      <h3 className='text-xl px-4'>All Reviews</h3>
      <ReviewsDisplay reviews={user.reviews} />
    </div>
}
