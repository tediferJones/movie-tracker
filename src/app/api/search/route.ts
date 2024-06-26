import { NextResponse } from 'next/server';
import easyFetch from '@/lib/easyFetch';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // passing empty strings to omdbAPI could be problematic
  const queryTerm = searchParams.get('queryTerm') || '';
  const queryType = searchParams.get('queryType') || '';
  const searchTerm = searchParams.get('searchTerm');
  const searchType = searchParams.get('searchType');
  // console.log(
  //   `\n QUERY TERM: ${queryTerm} 
  //   \n SEARCH TERM: ${searchTerm} 
  //   \n QUERY TYPE: ${queryType} 
  //   \n SEARCH TYPE: ${searchType} 
  //   \n`)
  const omdbResult = await easyFetch('https://www.omdbapi.com/', 'GET', { 
    apikey: process.env.OMDBAPI_KEY, 
    // This type is ignored for Season/Episode queries, so no need to override it
    [queryType]: searchType,
    [queryTerm]: searchTerm, 
  });

  return NextResponse.json(omdbResult)
}
