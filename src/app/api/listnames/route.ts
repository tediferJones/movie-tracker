import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  return NextResponse.json(
    await db.select({
      listname: listnames.listname,
      defaultList: listnames.defaultList
    }).from(listnames).where(
      eq(listnames.username, user.username)
    )
  )
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const { listname } = await req.json();
  if (!listname) return NextResponse.json('Bad request', { status: 400 })

  await db.update(listnames).set({ defaultList: false }).where(eq(listnames.username, user.username))
  await db.update(listnames).set({ defaultList: true }).where(
    and(
      eq(listnames.username, user.username),
      eq(listnames.listname, listname),
    )
  )

  return new NextResponse
}
