import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

// EVERY FUNCTION IN THIS FILE SHOULD USE THE currentUser obj to get the username,
// That way the only thing we are sending over the wire is the movie ID
// These routes are actually already protected by clerk auth, so nothing will run if there is no user signed in

// Rewrite all of this, switching to MONGODB, so no more SQL strings

export async function GET(req: Request) {
  // To be more restful, this function should actually return the users list
  // Re-write this in a HEAD function
  console.log('CHECKING myList')
  const { searchParams } = new URL(req.url);
  const imdbID = searchParams.get('imdbID');
  // console.log(imdbID);

  // TEST
  // await prisma.userList.deleteMany({});

  const user = await currentUser();
  const username = user?.username;
  // console.log(username);
  let mongoResult: null | object = null;
  if (username && imdbID) {
    mongoResult = await prisma.lists.findFirst({ 
      where: { 
        username, 
        imdbID 
      } 
    })
  }
  // console.log(mongoResult);

  return NextResponse.json({ exists: mongoResult !== null })
}

export async function POST(req: Request) {
  console.log('ADD MOVIE TO myList')
  const { imdbID } = await req.json();
  const user = await currentUser();
  const username = user?.username;
  // Push record to DB
  if (username && imdbID) {
    await prisma.lists.create({ data: { username, imdbID } })
  }

  return NextResponse.json('added movie to myList')
}

export async function DELETE(req: Request) {
  console.log('DELETE MOVIE FROM myList')
  const { searchParams } = new URL(req.url);
  const imdbID = searchParams.get('imdbID');
  // console.log(imdbID);

  const user = await currentUser();
  const username = user?.username;
  // console.log(username);

  if (username && imdbID) {
    // We use deleteMany because delete only accepts unique identifiers, so we would have to query DB, find its unique ID, and delete it, instead we just delete all matching records, cuz each record should be unique
    await prisma.lists.deleteMany({
      where: {
        username,
        imdbID
      },
    })
  }

  return NextResponse.json('deleted movie from myList')
}
