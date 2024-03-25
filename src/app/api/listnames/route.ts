import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  return NextResponse.json(
    await db.select().from(listnames).where(eq(listnames.username, user.username))
  )
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { listname } = await req.json();
  console.log('new list name', listname)

  await db.insert(listnames).values({
    listname,
    username: user.username,
  })

  return new NextResponse;
}
