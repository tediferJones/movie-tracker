import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';

export async function GET(req: Request) {
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
  const data = await req.json();

  // Should probably verify the params on the data var are correct before pushing to DB
  if (user?.username && data) {
    await prisma.reviews.create({
      data: {
        ...data,
        username: user.username,
      }
    })
  }
  return NextResponse.json('reviews POST request')
}

export async function PUT(req: Request) {
  console.log('\n REVIEW PUT REQUEST \n')
  const user = await currentUser();
  const data = await req.json();
  delete data.id;

  // Should probably verify the params on the data var are correct before pushing to DB
  if (user?.username && data) {
    await prisma.reviews.update({
      where: {
        username_imdbID: {
          username: user.username,
          imdbID: data.imdbID,
        },
      },
      data,
    })
  }

  return NextResponse.json('reviews PUT request')
}

export async function DELETE(req: Request) {
  const imdbID = new URL(req.url).searchParams.get('imdbID');
  console.log(imdbID);
  return NextResponse.json('reviews DELETE request')
}
