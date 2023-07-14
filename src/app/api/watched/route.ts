import { NextResponse  } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/client';
import { watched } from '@prisma/client';

export async function GET(req: Request) {
  const imdbID = new URL(req.url).searchParams.get('imdbID')
  const user = await currentUser();
  let dbResult: null | watched[] = null;
  
  if (user?.username && imdbID) {
    dbResult = await prisma.watched.findMany({
      where: {
        username: user.username,
        imdbID,
      }
    })
  }
  
  // If user but no imdbID, return all records with matching username
  if (user?.username && !imdbID) {
    dbResult = await prisma.watched.findMany({
      where: {
        username: user.username,
      },
    })
  }

  return NextResponse.json(dbResult)
}

export async function POST(req: Request) {
  const { imdbID, watchedDate } = await req.json();
  const user = await currentUser();
  console.log(imdbID)
  if (user?.username && imdbID && watchedDate) {
    console.log('POST RECORD TO DB')
    console.log(user.username, imdbID, watchedDate)
    await prisma.watched.create({
      data: {
        username: user.username,
        date: watchedDate,
        imdbID,
      }
    })
    return NextResponse.json('Successfully added record')
  }
  return NextResponse.json('Bad request', { status: 400 })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  const user = await currentUser();
  if (user?.username && id) {
    await prisma.watched.delete({
      where: {
        id_username: {
          id,
          username: user.username,
        }
      }
    })
    return NextResponse.json('Successfully deleted record')
  }
  return NextResponse.json('Bad request', { status: 400 })
}
