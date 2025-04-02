import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const allUsernames = (
    await clerkClient.users.getUserList()
  ).map(user => user.username);

  return NextResponse.json(
    allUsernames.sort().map(username => ({ username }))
  );
}
