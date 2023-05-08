import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  return NextResponse.json({ test: 'YEET' })
}

export async function POST() {
  const prisma = new PrismaClient();
  // DO SOME DATABASE SHIT HERE
  // Check for existing username or email
  //    - If email exists, forward to login page, account already exists
  //    - If username exists, send back to sign-up, tell them to make a new username
  //
  // WE NEED SOME WAY TO RECEIVE REQUEST DATA
  const test = await prisma.user.findMany();
  console.log('');
  // console.log(req);
  console.log('IDK SOME TEXT WHERE WILL TO SHOW UP')
  console.log(test);
  console.log('');
  return NextResponse.json({ test: 'API POST ROUTE' })
}
