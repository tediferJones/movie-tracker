import cache from '@/lib/cache';
import { NextResponse } from 'next/server';
import { GET as MediaGet } from '@/app/api/media/[imdbId]/route';

type Params = { imdbId: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { imdbId } = params;

  if (!cache.get(imdbId)) {
    await MediaGet(req, { params });
  }
  return NextResponse.json(cache.get(imdbId).title);
}
