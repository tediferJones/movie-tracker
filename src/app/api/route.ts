import { NextResponse } from 'next/server';
import prisma from '../../client';

export async function GET() {
  // dont use req with GET method, u dummy
  console.log('API GET REQUEST')
  return NextResponse.json({ test: 'This is a test 9000' })
}

export async function POST(req: Request) {
  console.log('START API POST REQUEST')
  const body = await req.json();
  console.log(body.userId)
  console.log(body.imdbId)
  // CHECK DB BEFORE ADDING, IF THIS EXACT RECORD ALREADY EXISTS DONT ADD IT
  // Technically our front-end logic should prevent this from happening, but do we trust react to do its job? No
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
