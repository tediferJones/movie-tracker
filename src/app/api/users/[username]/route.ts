import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json('Please use /api/users/<USERID>/<RESOURCE> to access user data')
}
