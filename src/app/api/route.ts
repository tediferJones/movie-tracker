import { NextResponse } from 'next/server';
import prisma from '../../client';

export async function GET() {
  console.log('API GET REQUEST')
  return NextResponse.json({ test: 'This is a test 9000' })
}

export async function POST(req: Request) {
  console.log('START API POST REQUEST')
  const body = await req.json();
  console.log(body.userId)
  console.log(body.imdbId)
  const dbResult = await prisma.$queryRaw
      `INSERT INTO MovieList 
      (userId, imdbId)
      VALUES
      (${body.userId}, ${body.imdbId})`
      // `SELECT * FROM MovieList`
  console.log(dbResult)
  console.log(body);
  console.log('END API POST REQUEST')
  return NextResponse.json({ idk: 'we did it' })
}
