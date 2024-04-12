'use client';
import ListManager from '@/components/listManager';
import MediaInfo from '@/components/mediaInfo';
import ReviewManager from '@/components/reviewManager';
import WatchManger from '@/components/watchManager';

export default function Media({ params }: { params: { imdbId: string } }) {
  const { imdbId } = params;
  return <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
    <MediaInfo imdbId={imdbId}/>
    <div className='relative flex flex-wrap gap-4'>
      <WatchManger imdbId={imdbId} />
      <ListManager imdbId={imdbId} />
    </div>
    <ReviewManager imdbId={imdbId}/>
  </div>
}
