import ListManager from '@/components/pages/mediaPage/listManager';
import MediaInfo from '@/components/pages/mediaPage/mediaInfo';
import ReviewManager from '@/components/pages/mediaPage/reviewManager';
import WatchManger from '@/components/pages/mediaPage/watchManager';

export default function MediaPage({ imdbId }: { imdbId: string }) {
  return <>
    <MediaInfo imdbId={imdbId} />
    <div className='relative flex flex-wrap gap-4'>
      <WatchManger imdbId={imdbId} />
      <ListManager imdbId={imdbId} />
    </div>
    <ReviewManager imdbId={imdbId} />
  </>
}
