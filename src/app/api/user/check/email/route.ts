import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const { email } = await req.json();
  const result: [] = await prisma.$queryRaw
    `SELECT * FROM user WHERE email=${email}`;
  
  return NextResponse.json(!(result.length === 0))
}
