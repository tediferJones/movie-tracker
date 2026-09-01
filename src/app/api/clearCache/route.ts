import { NextResponse } from 'next/server';
import { serverHashCache } from '@/lib/hashCache/config';
import { cache } from '@/lib/dataCache/config';

export async function GET() {
  serverHashCache.cache = {};
  cache.cache = { media: {}, users: {} };
  console.log('CLEARED')
  return NextResponse.json('Success');
}
