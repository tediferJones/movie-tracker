'use client';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';
import WatchManger from '@/components/pages/mediaPage/watchManager';
import ListManager from '@/components/pages/mediaPage/listManager';
import ReviewManager from '@/components/pages/mediaPage/reviewManager';

export default function Media({ params }: { params: { imdbId: string } }) {
  const { imdbId } = params;
  return <div className='w-4/5 m-auto mb-8 flex flex-col gap-4'>
    <MediaInfo imdbId={imdbId} />
    <div className='relative flex flex-wrap gap-4'>
      <WatchManger imdbId={imdbId} />
      <ListManager imdbId={imdbId} />
    </div>
    <ReviewManager imdbId={imdbId} />
  </div>
}
