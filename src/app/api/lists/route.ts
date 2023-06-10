import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

// Most of these routes will need rewritten
// This api route should only hanlde user's lists
// GET: return all lists for a user, or a specific list if specified
// POST: create a new list with specified name
// PUT: add a movie to specified list
// DELETE: remove movie from specified list
// HEAD?: check if movie exists in a specified list

export async function GET(req: Request) {
  console.log('\n GET USER LIST \n')
  const user = await currentUser();
  // REWRITE THIS TO RETURN A SPECIFIC MOVIE IF GET REQUEST HAS SEARCHPARAMS
  // i.e. if (searchParams) return Single movie related to this userame, else return all movies related to this user
  //
  // required search params: username
  // optional search params: imdbID, listname
  // if neither: return array of listnames
  // if only listname: return array of imdbIDs
  // if only imdbID: idk? probably dont have to worry about that
  // if both, 
  //

  // OR just return all the users data
  // This becomes a problem when we want to fetch other users data
  
  const imdbID = new URL(req.url).searchParams.get('imdbID');
  const listname = new URL(req.url).searchParams.get('listname');
  console.log(imdbID)

  if (user?.username && !imdbID && !listname) {
    // const dbResult = await prisma.lists.findMany({});
    const dbResult = await prisma.lists.groupBy({
      by: ['listname'],
      where: { username: user.username }
    })
    return NextResponse.json(dbResult.map((item: { listname: string }) => item.listname));
  }

  if (user?.username && listname && imdbID) {
    const dbResult = await prisma.lists.findFirst({
      where: {
        username: user.username,
        listname,
        imdbID,
      },
    });

    return NextResponse.json(dbResult);

  }

  // if (user?.username && !imdbID && listname) {
  //   // if only username and listname, return all records in this user's specified list
  //   const dbResult = await prisma.lists.findMany({ where: { username: user.username, listname } })
  //   return NextResponse.json(dbResult)
  // }

  // if (user?.username && imdbID && listname) {
  //   const dbResult = await prisma.lists.findFirst({
  //     where: {
  //       username: user.username,
  //       listname,
  //       imdbID,
  //     }
  //   })
  //   console.log(dbResult);
  // }

  return NextResponse.json({}, { status: 404 })
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

export async function PUT(req: Request) {
  console.log('\n UPDATING MOVIE DETAILS \n')
  const user = await currentUser();
  const { movieDetailKey, movieDetailValue, imdbID } = await req.json();

  // console.log(movieDetailKey);
  // console.log(movieDetailValue);
  // console.log(imdbID);

  if (user?.username && imdbID) {
    await prisma.lists.updateMany({
      where: {
        imdbID,
        username: user.username,
      },
      data: {
        [movieDetailKey]: movieDetailValue,
      }
    })
  }
  return NextResponse.json('updated movie details');
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
