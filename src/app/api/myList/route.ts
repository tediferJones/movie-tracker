import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

// EVERY FUNCTION IN THIS FILE SHOULD USE THE currentUser obj to get the username,
// That way the only thing we are sending over the wire is the movie ID
// These routes are actually already protected by clerk auth, so nothing will run if there is no user signed in

export async function GET(req: Request) {
  console.log('CHECKING myList')
  const { searchParams } = new URL(req.url);
  const imdbId = searchParams.get('imdbId');
  console.log(imdbId);

  const user = await currentUser();
  const username = user?.username;
  console.log(username);
  const dbResult: object[] = await prisma.$queryRaw
      `SELECT * FROM myList WHERE username=${username} AND imdbId=${imdbId}`

  return NextResponse.json({ exists: dbResult.length > 0 })
}

export async function POST(req: Request) {
  console.log('ADD MOVIE TO myList')
  const { imdbId } = await req.json();
  const user = await currentUser();
  const username = user?.username;
  // Push record to DB
  await prisma.$queryRaw
      `INSERT INTO 
      myList (username, imdbId)
      VALUES (${username}, ${imdbId})`

  return NextResponse.json('added movie to myList')
}

export async function DELETE(req: Request) {
  console.log('DELETE MOVIE FROM myList')
  const { searchParams } = new URL(req.url);
  const imdbId = searchParams.get('imdbId');
  console.log(imdbId);

  const user = await currentUser();
  const username = user?.username;
  console.log(username);

  await prisma.$queryRaw
      `DELETE FROM myList WHERE username=${username} AND imdbId=${imdbId}`

  return NextResponse.json('deleted movie from myList')
}
