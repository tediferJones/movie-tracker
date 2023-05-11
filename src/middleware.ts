import { NextResponse, NextRequest } from 'next/server';
// import { PrismaClient } from '@prisma/client';

export async function middleware(req: NextRequest) {
  // console.log(req)
  const res = NextResponse.next();
  // const prisma = new PrismaClient();
  console.log("MIDDLEWARE FUNCTION")
  console.log(req.cookies.get('authKey'))
  // If the value exists in the db, give user auth, otherwise, no auth
  // If the req has proper cookies continue, else redirect to login page

  // Move this to the api route, that way it will run on the server,
  // Then use fetch to get their authorization status
  // const result = await prisma.$queryRaw
  //     `SELECT * FROM session WHERE authKey = ${req.cookies.get('authKey')?.value}`
  // console.log(result);
  return res;
}

export const config = {
  // WE ACTUALLY WANT THIS TO ONLY RUN ON /auth/:path*
  //    - Login and Signup routes exist in /api/, how are used supposed to signup without auth
  matcher: '/api/:path*'
}
