import { NextResponse  } from 'next/server';

export async function GET() {
  return NextResponse.json('this is the watched API route')
}
