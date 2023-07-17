import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';
import { userLists } from '@/types';

export async function GET(req: Request) {
  console.log('\n GET USER LIST \n')
  const user = await currentUser();
  const username = new URL(req.url).searchParams.get('username')

  if (user?.username) {
    // Create defaultList table, { username: string, listname: string} @unique(username)
    // On the client, make sure to check if defaultListname exists in returned lists, if not set selector the same way we do now
    //    - What if user deletes the list (i.e. deletes all the contents) that is their default list?
    const defaultList  = await prisma.defaultList.findUnique({ where: { username: username ? username : user.username }})
    console.log('THIS IS A TEST', defaultList)

    // Returns an obj structured like so { defaultList: 'someListname', listname: [imdbID1, imdbID2], listname2: [imdbID3], etc... } 
    const dbResult = await prisma.lists.findMany({ where: { username: username ? username : user.username } })
    let newObj: { [key: string]: string[] } = {};
    dbResult.forEach((review: any) => {
      if (newObj[review.listname] === undefined) {
        newObj[review.listname] = [review.imdbID];
      } else {
        newObj[review.listname].push(review.imdbID)
      }
    })
    const result: userLists = {
      defaultListname: defaultList ? defaultList.defaultListname : '',
      lists: newObj,
    };
    return NextResponse.json(result);
  }
}

export async function POST(req: Request) {
  console.log('\n ADD MOVIE TO myList \n')
  const { listname, imdbID } = await req.json();
  const user = await currentUser();

  // Push record to DB
  if (user?.username && listname && imdbID) {
    const username = user.username;
    await prisma.lists.create({ data: { username, listname, imdbID } })
  }

  return NextResponse.json('added movie to myList')
}

export async function DELETE(req: Request) {
  console.log('\n DELETE MOVIE FROM myList \n')
  const user = await currentUser();
  const { searchParams } = new URL(req.url);
  // const imdbID = new URL(req.url).searchParams.get('imdbID')
  const imdbID = searchParams.get('imdbID');
  const listname = searchParams.get('listname');
  // console.log(imdbID);

  if (user?.username && listname && imdbID) {
    // We use deleteMany because delete only accepts unique identifiers, so we would have to query DB, find its unique ID, and delete it, instead we just delete all matching records, cuz each record should be unique
    // Or you can just username and imdbID unique attributes in the prisma schema, in theory, they're should be unqiue anyways
    const username = user.username;
    await prisma.lists.deleteMany({
      where: {
        username,
        listname,
        imdbID,
      },
    })
  }

  return NextResponse.json('deleted movie from myList')
}
