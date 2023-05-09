// import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const { username, password } = await req.json();
  const result: [] = await prisma.$queryRaw
    `SELECT * FROM user WHERE
    username=${username} AND password=${password}`;

  // THIS IS WHERE WE DO THE AUTH
  // Need to generate the cookie
    // save a copy of the key and its username to the db
    // give the user said cookie
    // To use Auth: create middlewear that runs on every page
    //    - If cookie exists, see if its key is valid, if it is perform authorized action, else send them to the login page

  if (result.length > 0 && result.length < 2) {
    console.log('SUCCESSFULL LOGIN')
  } else {
    console.log('FAILURE TO LOGIN')
  }
  // return NextResponse.json('idkHi')
}
