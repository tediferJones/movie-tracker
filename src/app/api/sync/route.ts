import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { serverHashCache } from '@/lib/hashCache/config';

// FIX ME, we should only need GET and maybe DELETE, we also don't need hashTable or hashCacheV4
export async function GET(req: Request) {
  const user = await currentUser();

  if (!user?.username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('v') === '5') {
    console.log('V5 detected', serverHashCache.getHashes(user.username))
    return NextResponse.json(serverHashCache.getHashes(user.username));
  }

  return NextResponse.json(serverHashCache.cache[user.username] || null);
}

export async function DELETE() {
  const user = await currentUser();

  if (!user?.username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  delete serverHashCache.cache[user.username];
  return NextResponse.json('Success');
}
