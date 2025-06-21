import { NextResponse } from 'next/server';
import { Hashes, Resources, SyncResponse } from '@/lib/hashCache';
import { currentUser } from '@clerk/nextjs';

export const resources: Resources[] = [ 'watched', 'reviews' ];

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }
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
