import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { serverHashCache } from '@/lib/hashCache/config';

export async function GET() {
  const user = await currentUser();

  if (!user?.username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  return NextResponse.json(serverHashCache.getHashes(user.username));
}

export async function DELETE() {
  const user = await currentUser();

  if (!user?.username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  delete serverHashCache.cache[user.username];
  return NextResponse.json('Success');
}
