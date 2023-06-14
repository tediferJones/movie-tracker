import { NextResponse } from 'next/server';
import easyFetch from '@/modules/easyFetch';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchTerm = searchParams.get('searchTerm');
  const searchType = searchParams.get('searchType');
  console.log(`\n SEARCH TYPE: ${searchType} \n`)
  const omdbResult = await easyFetch('https://www.omdbapi.com/', 'GET', { 
    apikey: process.env.OMDBAPI_KEY, 
    type: searchType,
    s: searchTerm, 
  });

  return NextResponse.json(await omdbResult.json())
}
