'use client';

import ReviewsDisplay from '@/components/subcomponents/reviewsDisplay';
import WatchedDisplay from '@/components/subcomponents/watchedDisplay';
import ListsDisplay from '@/components/subcomponents/listsDisplay';
import DefaultListManager from '@/components/subcomponents/defaultListManager';
import MultiTable from '@/components/table/multiTable';

export default function UserPage(
  {
    username,
    useDefaultListManager
  }: {
    username: string,
    useDefaultListManager?: true
  }
) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-4'>
        <WatchedDisplay username={username} />
        {useDefaultListManager ? <DefaultListManager /> : <ListsDisplay username={username} />}
      </div>
      <MultiTable username={username} />
      <h3 className='text-xl px-4'>Your Reviews</h3>
      <ReviewsDisplay username={username} />
    </div>
  )
}
