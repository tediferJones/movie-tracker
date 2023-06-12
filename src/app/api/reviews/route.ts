import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

export async function GET(req: Request) {
  // search DB for record with username&imdbID
  // if it exists, return it, else return null
  console.log('\n REVIEW GET REQUEST \n')
  const user = await currentUser();
  const imdbID = new URL(req.url).searchParams.get('imdbID')
  let dbResult = null;
  console.log(imdbID)
  if (user?.username && imdbID) {
    dbResult = await prisma.reviews.findFirst({ where: { username: user.username, imdbID } })
  }
  return NextResponse.json(dbResult, { status: dbResult ? 200 : 404 });
}

export async function POST(req: Request) {
  console.log('\n REVIEW POST REQUEST \n')
  const user = await currentUser();
  const { imdbID } = await req.json();
  console.log(imdbID)
  if (user?.username && imdbID) {
    const createResult = await prisma.reviews.create({ data: { username: user.username, imdbID } })
    console.log(createResult)
  }
  return NextResponse.json('reviews POST request')
}

export async function PUT(req: Request) {
  console.log('\n REVIEW PUT REQUEST \n')
  const user = await currentUser();
  // Should probably verify movieDetailKey is what we expect
  // We dont want users adding attributes that we dont know about
  const { movieDetailKey, movieDetailValue, imdbID } = await req.json();
  console.log(imdbID);

  if (user?.username && imdbID) {
    await prisma.reviews.update({
      where: {
        username_imdbID: {
          username: user.username,
          imdbID,
        },
      },
      data: {
        [movieDetailKey]: movieDetailValue,
      },
    })
  }

  return NextResponse.json('reviews PUT request')
}

export async function DELETE(req: Request) {
  const imdbID = new URL(req.url).searchParams.get('imdbID');
  console.log(imdbID);
  return NextResponse.json('reviews DELETE request')
}
