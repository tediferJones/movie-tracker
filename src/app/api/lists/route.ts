import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { db } from '@/drizzle/db';
import { lists } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.username) return NextResponse.json('Unauthorized', { status: 401 })

  const imdbId = new URL(req.url).searchParams.get('imdbId')
  if (!imdbId) return NextResponse.json('Bad request', { status: 400 })

  return NextResponse.json(
    await db.select().from(lists).where(
      and(
        eq(lists.username, user.username),
        eq(lists.imdbId, imdbId)
      )
    )
  )
}

// import { lists } from '@prisma/client';
// import prisma from '@/client';
// 
// export async function GET(req: Request) {
//   console.log('\n GET USER LIST \n')
//   const user = await currentUser();
//   const username = new URL(req.url).searchParams.get('username')
//   const imdbID = new URL(req.url).searchParams.get('imdbID')
//   let result: userLists | lists[] | null = null;
// 
//   // Return all records associated with a specific user
//   if (user?.username && !imdbID) {
//     const defaultList  = await prisma.defaultList.findUnique({ where: { username: username ? username : user.username }})
// 
//     const dbResult = await prisma.lists.findMany({ where: { username: username ? username : user.username } })
//     let newObj: { [key: string]: string[] } = {};
//     dbResult.forEach((review: any) => {
//       if (newObj[review.listname] === undefined) {
//         newObj[review.listname] = [review.imdbID];
//       } else {
//         newObj[review.listname].push(review.imdbID)
//       }
//     })
// 
//     result = {
//       defaultListname: defaultList ? defaultList.defaultListname : '',
//       lists: newObj,
//     };
//   }
// 
//   // Return all records associated with a specific imdbID
//   if (user?.username && imdbID) {
//     result = await prisma.lists.findMany({ where: { imdbID }})
//   }
//   return NextResponse.json(result);
// }
// 
// export async function POST(req: Request) {
//   console.log('\n ADD MOVIE TO myList \n')
//   const { listname, imdbID } = await req.json();
//   const user = await currentUser();
// 
//   // Push record to DB
//   if (user?.username && listname && imdbID) {
//     const username = user.username;
//     await prisma.lists.create({ data: { username, listname, imdbID } })
//   }
// 
//   return NextResponse.json('added movie to myList')
// }
// 
// export async function DELETE(req: Request) {
//   console.log('\n DELETE MOVIE FROM myList \n')
//   const user = await currentUser();
//   const imdbID = new URL(req.url).searchParams.get('imdbID')
//   const listname = new URL(req.url).searchParams.get('listname')
// 
//   if (user?.username && listname && imdbID) {
//     await prisma.lists.delete({
//       where: {
//         username_listname_imdbID: {
//           username: user.username,
//           listname,
//           imdbID,
//         }
//       }
//     })
//   }
// 
//   return NextResponse.json('deleted movie from myList')
// }
