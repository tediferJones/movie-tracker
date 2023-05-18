import { NextResponse } from 'next/server';
import prisma from '@/client';

export async function GET() {
  return NextResponse.json({ get: 'we in the get route of movielist check api route' })
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log('IN MOVIELIST CHECK API ROUTE')
  console.log(body);
  const result: object[] = await prisma.$queryRaw
      `SELECT * FROM MovieList WHERE userId=${body.userId} AND imdbId=${body.imdbId}`
  // console.log(result);
  if (result.length > 0) {
    return NextResponse.json({ exists: true })
  } else {
    return NextResponse.json({ exists: false })
  }
  // Turn the above into a ternary
  // return NextResponse.json({ itWorks: 'Idk does it' })
}
