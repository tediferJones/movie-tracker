import { getManyExistingMediaV2 } from '@/lib/getManyExistingMedia';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  const [ mediaInfo ] = await getManyExistingMediaV2([ imdbId ]);
  return mediaInfo.title;
}
