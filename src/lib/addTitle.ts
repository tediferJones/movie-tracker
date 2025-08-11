import { cache } from '@/lib/dataCache/config';
import { getManyExistingMedia } from '@/lib/getManyExistingMedia';

export default async function addTitle<T extends { imdbId: string }>(
  arr: T[]
): Promise<(T & { title: string })[]> {
  await getManyExistingMedia(arr.map(item => item.imdbId));
  return arr.map(item => {
    const mediaInfo = cache.get('media', item.imdbId, 'mediaInfo');
    if (!mediaInfo) throw Error('could not find media info');
    return { ...item, title: mediaInfo.title };
  });
}
