import { NextResponse } from 'next/server';
import { Hashes, isNormalResource, isSpecialResource, ListContentType, Resources, resources, SyncResponse } from '@/lib/hashCache';
import { currentUser } from '@clerk/nextjs';
import { hashTable } from '@/lib/hashCache';

// export const resources: Resources[] = [ 'watched', 'reviews' ];

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
  // const needsSynced = resources.filter(resource => {
  //   return userHashes.resources[resource] !== clientHashes.resources[resource];
  // });

  const needsSynced = resources.reduce((needsSynced, resource) => {
    if (isNormalResource(resource)) {
      if (userHashes.resources[resource] !== clientHashes.resources[resource]) {
        needsSynced.push(resource);
      }
    } else if (isSpecialResource(resource)) {
      if (userHashes.resources[resource].hash !== clientHashes.resources[resource].hash) {
        // listContents master hash out of sync
        needsSynced.push(resource)
      }
    } else {
      throw Error('resource not recognized')
    }
    return needsSynced
  }, [] as [] as SyncResponse['needsSynced'])

  return NextResponse.json<SyncResponse>({
    synced: false,
    needsSynced,
  })
}
