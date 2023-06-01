import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

// EVERY FUNCTION IN THIS FILE SHOULD USE THE currentUser obj to get the username,
// That way the only thing we are sending over the wire is the movie ID
// These routes are actually already protected by clerk auth, so nothing will run if there is no user signed in

// Rewrite all of this, switching to MONGODB, so no more SQL strings

export async function GET() {
  console.log('GET user list')
  const user = await currentUser();
  let username;
  let dbResult: any[] = [];

  if (user) {
    username = user.username;
  }

  if (username) {
    dbResult = await prisma.lists.findMany({ where: { username } })
  }
  // console.log(dbResult)

  return NextResponse.json(dbResult.length > 0 ? dbResult : [])
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
    // Or you can just username and imdbID unique attributes in the prisma schema, in theory, they're should be unqiue anyways
    await prisma.lists.deleteMany({
      where: {
        username,
        imdbID
      },
    })
  }

  return NextResponse.json('deleted movie from myList')
}

export async function HEAD(req: Request) {
  // THESE API ROUTE IS FOR ADDTOMYLIST CHECKER FUNC
  console.log('Checking user list for imdbID');
  const { searchParams } = new URL(req.url);
  // Dont get username from req, req can be changed by user, so the only thing that goes in the REQ is imdbID, username is fetched inside the api route
  const imdbID = searchParams.get('imdbID')
  let username;
  // console.log(username)

  const user = await currentUser();
  if (user) {
    username = user.username;
  }

  let dbResult: null | object = null;

  if (username && imdbID) {
    dbResult = await prisma.lists.findFirst({ where: { username, imdbID } })
  }
  console.log(dbResult)

  return NextResponse.json({}, { status: dbResult === null ? 404 : 200 })
}
