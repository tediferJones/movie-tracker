import { getManyExistingMedia } from '@/lib/getManyExistingMedia';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  const [ mediaInfo ] = await getManyExistingMedia([ imdbId ]);
  return mediaInfo.title;
}
