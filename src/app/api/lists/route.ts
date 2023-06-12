import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

export async function GET() {
  console.log('\n GET USER LIST \n')
  const user = await currentUser();

  if (user?.username) {
    // Returns an obj structured like so { listname: [imdbID1, imdbID2], listname2: [imdbID3], etc... } 
    const dbResult = await prisma.lists.findMany({ where: { username: user.username } })
    let newObj: { [key: string]: string[] } = {};
    dbResult.forEach((review: any) => {
      if (newObj[review.listname] === undefined) {
        newObj[review.listname] = [review.imdbID];
      } else {
        newObj[review.listname].push(review.imdbID)
      }
    })
    return NextResponse.json(newObj);
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

// probably delete this
// export async function PUT(req: Request) {
//   console.log('\n UPDATING MOVIE DETAILS \n')
//   const user = await currentUser();
//   const { movieDetailKey, movieDetailValue, imdbID } = await req.json();
// 
//   // console.log(movieDetailKey);
//   // console.log(movieDetailValue);
//   // console.log(imdbID);
// 
//   if (user?.username && imdbID) {
//     await prisma.lists.updateMany({
//       where: {
//         imdbID,
//         username: user.username,
//       },
//       data: {
//         [movieDetailKey]: movieDetailValue,
//       }
//     })
//   }
//   return NextResponse.json('updated movie details');
// }

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

// export async function HEAD(req: Request) {
//   // You can delete this because all head routes are automagically generated
//   console.log('\n Checking user list for imdbID \n');
//   const imdbID = new URL(req.url).searchParams.get('imdbID')
//   const user = await currentUser();
//   let dbResult: null | object = null;
// 
//   if (user?.username && imdbID) {
//     const username = user.username;
//     dbResult = await prisma.lists.findFirst({ where: { username, imdbID } })
//   }
// 
//   return NextResponse.json({}, { status: dbResult === null ? 404 : 200 })
// }
