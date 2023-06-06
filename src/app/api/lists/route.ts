import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

export async function GET(req: Request) {
  console.log('\n GET USER LIST \n')
  // REWRITE THIS TO RETURN A SPECIFIC MOVIE IF GET REQUEST HAS SEARCHPARAMS
  // i.e. if (searchParams) return Single movie related to this userame, else return all movies related to this user
  const imdbID = new URL(req.url).searchParams.get('imdbID')
  const user = await currentUser();
  let dbResult: any[] = [];

  if (user?.username) {
    if (imdbID) {
      console.log('\n Found params returning single record \n')
      return NextResponse.json(await prisma.lists.findFirst({ where: { username: user.username, imdbID } }))
    } else {
      console.log('\n No params found returning all list records related to this username \n')
      dbResult = await prisma.lists.findMany({ where: { username: user.username } })
    }
  }
  console.log(dbResult)

  return NextResponse.json(dbResult.length > 0 ? dbResult : [])
}

export async function POST(req: Request) {
  console.log('\n ADD MOVIE TO myList \n')
  const { imdbID } = await req.json();
  const user = await currentUser();

  // Push record to DB
  if (user?.username && imdbID) {
    const username = user.username;
    await prisma.lists.create({ data: { username, imdbID } })
  }

  return NextResponse.json('added movie to myList')
}

// PUT function goes here, use it to toggle attributes like "watched", "watchAgain", etc...

export async function DELETE(req: Request) {
  console.log('\n DELETE MOVIE FROM myList \n')
  const user = await currentUser();
  const imdbID = new URL(req.url).searchParams.get('imdbID')
  // console.log(imdbID);

  if (user?.username && imdbID) {
    // We use deleteMany because delete only accepts unique identifiers, so we would have to query DB, find its unique ID, and delete it, instead we just delete all matching records, cuz each record should be unique
    // Or you can just username and imdbID unique attributes in the prisma schema, in theory, they're should be unqiue anyways
    const username = user.username;
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
  console.log('\n Checking user list for imdbID \n');
  const imdbID = new URL(req.url).searchParams.get('imdbID')
  const user = await currentUser();
  let dbResult: null | object = null;

  if (user?.username && imdbID) {
    const username = user.username;
    dbResult = await prisma.lists.findFirst({ where: { username, imdbID } })
  }

  return NextResponse.json({}, { status: dbResult === null ? 404 : 200 })
}
