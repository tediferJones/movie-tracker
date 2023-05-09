import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  return NextResponse.json({ test: 'YEET' })
}

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  // Sanitize and validate on both the client and server
  // Check for existing username or email
  //    - If email exists, forward to login page, account already exists
  //    - If username exists, send back to sign-up, tell them to make a new username
  // Check if password and passwordConfirm match
  //
  // THIS IS HOW YOU ACCESS REQ DATA
  const reqBody = await req.json();
  // const { email, username, password } = await req.json();
  // THIS IS HOW YOU ACCESS THE DATABASE
  // const test = await prisma.user.findMany();
  const test = await prisma.$queryRaw`SELECT * FROM user`
  const insert = await prisma.$queryRaw`INSERT INTO user (email, username, password)
      VALUES (
        ${reqBody.email},
        ${reqBody.username}, 
        ${reqBody.password}
      );`
  console.log('');
  // console.log(reqBody);
  console.log(insert)
  console.log('IDK SOME TEXT WHERE WILL TO SHOW UP')
  console.log(test);
  console.log('');
  return NextResponse.json({ test: 'API POST ROUTE' })
}

// STEP TO BUILDING AUTH
//    1. Build sign-up form, figure out how to send data from form to DB, and create a user
//    2. Get login form working, needs to compare form data to DB data on the server
//    3. Get Password hashing working (probs end up using bcryptJS)
//        - Delete all old accounts once hashing is working, they will be inaccessible from this point forward
//    4. Implement the authCookie

// We still need to figure out how to authorize user accounts
//    - On login, we give the client a cookie/token with the following data:
//        { username, uuid }
//    - We make a copy of this cookie and store it in the DB
//    - Everytime a user makes a change requiring authorization, validate their cookie matches the one in the DB
//    - When user logs out the cookie is deleted from the server
//
//    UUIDv4 might not be the best for this as its outputs can be predicatable, we need something that generates truly random strings
//      - Could try something like this: "var token = crypto.randomBytes(64).toString('hex');"
//      - Or use a third party npm package like: https://www.npmjs.com/package/crypto-random-string
//
//    Cookies can only be read by the site that created them, so other services like browser extensions can't highjack the cookie


// Is it possible to make a good fake of this cookie?
//    - hacker needs to know the username (easy to find) and the uuid(impossible? to find)
//    - How could a hacker find the uuid?
//      - If they have access to our DB, we have bigger problems
//      - If they have access to the authentic cookie, not much we can do about that
//      - It would be nearly impossible to guess the right uuid
