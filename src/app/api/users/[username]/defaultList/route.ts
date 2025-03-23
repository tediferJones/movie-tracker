import { db } from '@/drizzle/db';
import { listnames } from '@/drizzle/schema';
import cache from '@/lib/cache';
import { isValid } from '@/lib/inputValidation';
import { currentUser } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type Params = { username: string }

export async function GET(req: Request, { params }: { params: Params }) {
  const { username } = params;
  const cacheStr = `${username},defaultList`

  try {
    if (!cache.get(cacheStr)) {
      const defaultListRec = await db.select({ listname: listnames.listname }).from(listnames).where(
        and(
          eq(listnames.username, username),
          eq(listnames.defaultList, true),
        )
      ).get();
      cache.set(cacheStr, defaultListRec?.listname || null)
    }
    return NextResponse.json(cache.get(cacheStr))
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  // update default list
  // if there is no newDefaultListname param, only remove old defaultListname
  const { username } = params;
  const { searchParams } = new URL(req.url);

  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  try {
    await db.update(listnames).set({ defaultList: false }).where(
      and(
        eq(listnames.username, username),
        eq(listnames.defaultList, true)
      )
    );
    cache.delete(`${username},defaultList`)
    if (searchParams.has('newDefaultListname')) {
      const newDefaultListname = searchParams.get('newDefaultListname')!;
      const valid = isValid({ listname: newDefaultListname });
      if (!valid) return NextResponse.json('Inputs are not valid', { status: 422 });

      await db.update(listnames).set({ defaultList: true }).where(
        and(
          eq(listnames.username, username),
          eq(listnames.listname, newDefaultListname),
        )
      );
    }
    return new NextResponse()
  } catch {
    return NextResponse.json('Failed to process request, database error', { status: 500 });
  }
}
