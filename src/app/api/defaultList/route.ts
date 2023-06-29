import { NextResponse } from 'next/server';
import { currentUser  } from '@clerk/nextjs';
import prisma from '@/client';

// THIS ROUTE SHOULD ONLY AFFECT LOGGED IN USERS DATA
// No point in being able to view other users defaultList, right?
// Definitely shouldnt be able to POST/PUT/DELETE other users defautList

export async function GET() {
  console.log('\n GET USERS DEFAULT LIST \n')
  const user = await currentUser();
  let dbResult = null;

  if (user?.username) {
    dbResult = await prisma.defaultList.findUnique({ where: { username: user.username }})
  }

  // Make sure this handles HEAD requests properly
  return NextResponse.json(dbResult)
}

export async function POST(req: Request) {
  const user = await currentUser();
  const { defaultListname } = await req.json();

  if (user?.username && defaultListname) {
    await prisma.defaultList.create({ 
      data: {
        username: user.username,
        defaultListname,
      }
    })
    return NextResponse.json('Successfully added defaultList')
  }
  return NextResponse.json('You are not logged in, or you did not include a defaultListname', { status: 400 })
}

export async function PUT(req: Request) {
  const user = await currentUser();
  const { defaultListname } = await req.json();

  if (user?.username && defaultListname) {
    await prisma.defaultList.update({
      where: {
        username: user.username,
      },
      data: {
        defaultListname,
      }
    })
    return NextResponse.json('Successfully updated defaultList')
  }
  return NextResponse.json('Failed to update defaultList')
}

export async function DELETE() {
  const user = await currentUser()
  // username is unique in the defaultList table's schema, this makes deleting very easy
  if (user?.username) {
    await prisma.defaultList.delete({ where: { username: user.username } })
    return NextResponse.json('Successfully deleted defaultList')
  } 
  return NextResponse.json('Failed to delete defaultList')
}
