import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/drizzle/db';
import { watched } from '@/drizzle/schema';
import addTitle from '@/lib/addTitle';
import { useCache } from '@/lib/useCache';

type Params = { username: string }

export async function POST(req: Request, { params }: { params: Params }) {
  const { username } = params;
  const user = await currentUser();
  if (!user?.username || user.username !== username) {
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  const { imdbId, date } = await req.json();
  if (!date || typeof(date) !== 'number') {
    return NextResponse.json('Bad Request', { status: 400 });
  }

  return useCache(req, 'POST', 'users', username, 'watched', async () => {
    const record = {
      username: username,
      imdbId,
      date,
    }
    const { lastInsertRowid } = await db.insert(watched).values(record);
    const [ recordWithTitle ] = await addTitle([{
      ...record,
      id: Number(lastInsertRowid),
    }]);
    return recordWithTitle;
  })
}
