import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const { username } = await req.json();
  const result: [] = await prisma.$queryRaw
    `SELECT * FROM user WHERE username=${username}`;
  
  return NextResponse.json(!(result.length === 0))
}
