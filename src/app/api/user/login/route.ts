import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

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
    // use crypto.randomUUID();
    // console.log(crypto.randomUUID());
    const authKey = crypto.randomUUID();
    await prisma.$queryRaw
      `INSERT INTO session (username, authKey) 
      VALUES (${username}, ${authKey})`

    const test = cookies().get('authKey');
    console.log(test)
    const realRes = NextResponse.json({ YES: 'true' });
    realRes.cookies.set('authKey', authKey, { secure: true, httpOnly: true })
    return realRes
    
    // cookies().set('authKey', authKey)
    // return NextResponse.json({ authKey }).cookies.set('authKey', authKey)

    // return NextResponse.json({ authKey })
  } else {
    console.log('FAILURE TO LOGIN')
    return NextResponse.json({ error: 'Failed to login' })
  }
  // return NextResponse.json('idkHi')
}
