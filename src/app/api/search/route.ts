import { NextResponse } from 'next/server';
import easyFetch from '@/modules/easyFetch';

export async function GET(req: Request) {
  const searchTerm = new URL(req.url).searchParams.get('searchTerm');
  const omdbResult = await easyFetch('https://www.omdbapi.com/', 'GET', { 
    apikey: process.env.OMDBAPI_KEY, 
    s: searchTerm, 
  });

  return NextResponse.json(await omdbResult.json())
}
