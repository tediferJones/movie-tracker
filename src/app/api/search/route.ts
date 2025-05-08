import { NextResponse } from 'next/server';
import easyFetch from '@/lib/easyFetch';
import { OmdbSearch } from '@/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // passing empty strings to omdbAPI could be problematic
  const queryTerm = searchParams.get('queryTerm');
  const queryType = searchParams.get('queryType');
  const searchTerm = searchParams.get('searchTerm');
  const searchType = searchParams.get('searchType');
  const page = searchParams.get('page');
  // console.log({  queryTerm, searchTerm, queryType, searchType, page })
  // console.log(
  //   `\n QUERY TERM: ${queryTerm} 
  //   \n SEARCH TERM: ${searchTerm} 
  //   \n QUERY TYPE: ${queryType} 
  //   \n SEARCH TYPE: ${searchType} 
  //   \n`)


  // const omdbResult = await easyFetch('https://www.omdbapi.com/', 'GET', { 
  //   apikey: process.env.OMDBAPI_KEY, 
  //   // This type is ignored for Season/Episode queries, so no need to override it
  //   [queryType]: searchType,
  //   [queryTerm]: searchTerm, 
  // });

  if (!searchTerm) {
    return NextResponse.json(`URL paramter, 'searchTerm' is required, it can be any string`, { status: 400 });
  }

  const acceptableQueryTerms = ['s', 't', 'i'];
  if (!queryTerm || !acceptableQueryTerms.includes(queryTerm)) {
    return NextResponse.json(`URL parameter 'queryTerm' is required, options: ${acceptableQueryTerms.join(', ')}`, { status: 400 });
  }

  if (queryType !== 'type') {
    return NextResponse.json(`URL parameter 'queryTerm' must be set to 'type'`, { status: 400 });
  }

  const acceptableSearchTypes = ['movie', 'series', 'epside'];
  if (!searchType || !acceptableSearchTypes.includes(searchType)) {
    return NextResponse.json(`URL parameter 'searchType' is required, options: ${acceptableSearchTypes.join(', ')}`, { status: 400 });
  }

  const params = { 
    apikey: process.env.OMDBAPI_KEY, 
    // This type is ignored for Season/Episode queries, so no need to override it
    [queryType]: searchType,
    [queryTerm]: searchTerm, 
  }
  if (page) params.page = page;

  // const omdbResult = await easyFetch('https://www.omdbapi.com/', 'GET', params);

  // return NextResponse.json(omdbResult);

  return NextResponse.json(
    await easyFetch<OmdbSearch>('https://www.omdbapi.com/', 'GET', params)
  );
}
