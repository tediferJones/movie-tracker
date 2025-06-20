import { NextResponse } from 'next/server';
import { Hashes, Resources, SyncResponse } from '@/lib/hashCache';

const resources: Resources[] = [ 'watched', 'reviews' ];

export async function POST(req: Request) {
  const body: Hashes = await req.json();
  console.log(body)
  if (!body?.hash) {
    return NextResponse.json<SyncResponse>({
      synced: false,
      needsSynced: resources,
    })
  }
  // body has hashes, check serverHashCache for matches
  return NextResponse.json({ synced: false })
}
