import { NextResponse } from 'next/server';
import prisma from '@/client';

export async function POST(req: Request) {
  const body = await req.json();
  console.log(body)
  await prisma.$queryRaw`DELETE FROM MovieList WHERE userId=${body.userId} AND imdbId=${body.imdbId}`
  return NextResponse.json({ route: 'DELETE ROUTE' })
}
