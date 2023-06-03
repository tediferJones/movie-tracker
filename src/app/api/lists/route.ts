import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

export async function GET() {
  console.log('\n GET USER LIST \n')
  const user = await currentUser();
  let dbResult: any[] = [];

  if (user?.username) {
    dbResult = await prisma.lists.findMany({ where: { username: user.username } })
  }

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