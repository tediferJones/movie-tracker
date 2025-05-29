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

  if (!searchTerm) {
    return NextResponse.json(`URL paramter, 'searchTerm' is required, it can be any string`, { status: 400 });
  }

  const acceptableQueryTerms = ['s', 't', 'i'];
  if (!queryTerm || !acceptableQueryTerms.includes(queryTerm)) {
    return NextResponse.json(`URL parameter 'queryTerm' is required, options: ${acceptableQueryTerms.join(', ')}`, { status: 400 });
  }

  const acceptableQueryTypes = [ 'type', 'season' ];
  if (!queryType || !acceptableQueryTypes.includes(queryType)) {
    return NextResponse.json(`URL parameter 'queryType' is required, options: ${acceptableQueryTypes.join(', ')}`, { status: 400 });
  }

  const acceptableSearchTypes = ['movie', 'series', 'episode'];
  function searchTypeIsValid(searchType: string) {
    if (acceptableSearchTypes.includes(searchType)) return true;
    return !isNaN(Number(searchType));
  }

  if (!searchType || !searchTypeIsValid(searchType)) {
    return NextResponse.json(`URL parameter 'searchType' is required, options: ${acceptableSearchTypes.join(', ')}`, { status: 400 });
  }

  const params = { 
    apikey: process.env.OMDBAPI_KEY, 
    // What does this even mean?
    // This type is ignored for Season/Episode queries, so no need to override it
    [queryType]: searchType,
    [queryTerm]: searchTerm, 
  }
  if (page) params.page = page;

  return NextResponse.json(
    await easyFetch<OmdbSearch>({
      route: 'https://www.omdbapi.com/',
      method: 'GET',
      params,
    })
  );
}
