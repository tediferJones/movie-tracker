import ListManager from '@/components/pages/mediaPage/listManager';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';
import ReviewManager from '@/components/pages/mediaPage/reviewManager';
import WatchedManger from '@/components/pages/mediaPage/watchedManager';

export default function MediaPage({ imdbId }: { imdbId: string }) {
  return (
    <>
      <MediaInfo imdbId={imdbId} />
      <div className='flex flex-wrap gap-4'>
        <WatchedManger imdbId={imdbId} />
        <ListManager imdbId={imdbId} />
      </div>
      <ReviewManager imdbId={imdbId} />
    </>
  )
}
