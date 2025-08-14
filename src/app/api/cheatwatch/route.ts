import { db } from '@/drizzle/db';
import { watched } from '@/drizzle/schema';
import addTitle from '@/lib/addTitle';
// import { cache } from '@/lib/dataCache/config';
import { useCache } from '@/lib/useCache';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // FIX ME
  // delete old version
  // might be worth change this to, /api/cheatWatch/${username}
  // or even /api/users/${username}/cheatWatch
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 });

  const { imdbId, date } = await req.json();
  if (!date || typeof(date) !== 'number') return NextResponse.json('Bad Request', { status: 400 });

  return useCache(req, 'POST', 'users', user.username, 'watched', async () => {
    if (!user.username) throw Error('not signed in');
    const record = {
      username: user.username,
      imdbId,
      date,
    }
    const { lastInsertRowid } = await db.insert(watched).values(record);
    const [ recordWithTitle ] = await addTitle([{
      ...record,
      id: Number(lastInsertRowid)
    }]);
    return recordWithTitle;
  })

  // try {
  //   await db.insert(watched).values({
  //     username: user.username,
  //     imdbId,
  //     date,
  //   });

  //   // FIX ME, make sure this actually works
  //   cache.delete('users', user.username, 'watched');

  //   return new NextResponse();
  // } catch {
  //   return NextResponse.json('Failed to process request, database error', { status: 500 });
  // }
}
