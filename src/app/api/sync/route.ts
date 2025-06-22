import { NextResponse } from 'next/server';
import { Hashes, Resources, SyncResponse } from '@/lib/hashCache';
import { currentUser } from '@clerk/nextjs';
import { hashTable } from '@/lib/hashCache';

export const resources: Resources[] = [ 'watched', 'reviews' ];

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }
  const clientHashes: Hashes = await req.json();
  console.log('clientHash', clientHashes)

  const userHashes = hashTable.cache[user.username];
  console.log('serverHash', userHashes)
  if (!userHashes) {
    // no hashes exist, fetch all resources
    return NextResponse.json<SyncResponse>({
      synced: false,
      needsSynced: resources,
    });
  }

  if (userHashes.hash === clientHashes.hash) {
    // master hashes match, no need to scan resource hashes
    return NextResponse.json<SyncResponse>({
      synced: true,
      needsSynced: [],
    })
  }

  // master hashes do not match, scan resources to determine what resources need refetched
  const needsSynced = resources.filter(resource => {
    return userHashes.resources[resource] !== clientHashes.resources[resource];
  });

  return NextResponse.json<SyncResponse>({
    synced: false,
    needsSynced,
  })
}
