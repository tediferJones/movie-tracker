import { getManyExistingMedia } from '@/lib/getManyExistingMedia';
import { NextResponse } from 'next/server';
import { POST as mediaPOST } from '@/app/api/media/[imdbId]/route';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;
  let [ mediaInfo ] = await getManyExistingMedia([ imdbId ]);
  if (!mediaInfo.imdbId) {
    await mediaPOST(req, { params });
    [ mediaInfo ] = await getManyExistingMedia([ imdbId ]);
  }
  return NextResponse.json(mediaInfo.title);
}
