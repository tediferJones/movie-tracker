import { db } from '@/drizzle/db';
import { watched } from '@/drizzle/schema';
import addTitle from '@/lib/addTitle';
import { useCache } from '@/lib/useCache';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // FIX ME
  // might be worth change this to, /api/cheatWatch/${username}
  // or even /api/users/${username}/cheatWatch
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 });

  const { imdbId, date } = await req.json();
  if (!date || typeof(date) !== 'number') return NextResponse.json('Bad Request', { status: 400 });

  return useCache(req, 'POST', 'users', user.username, 'watched', async () => {
    // if this route gets moved to /api/users/${username}
    // then we can remove this check
    if (!user.username) throw Error('not signed in');
    const record = {
      username: user.username,
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
