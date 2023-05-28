import { NextResponse } from 'next/server';
import { cleanMovieInfo } from '@/types';
import cleanUpMovieInfo from '@/modules/cleanUpMovieInfo';
import prisma from '@/client';

export async function GET(req: Request) {
  console.log('FETCH SINGLE MOVIE RECORD FROM DB')
  const { searchParams } = new URL(req.url);
  const imdbID = searchParams.get('imdbID')
  let result = null;
  // console.log(imdbID)
  if (imdbID) {
    result = await prisma.movies.findFirst({ where: { imdbID } })
  }
  return NextResponse.json(result)
}

// EXTRACT THE FUNCTION THAT ADDS MOVIES TO OUR DB AND PUT IT HERE
// should be at the top of ../../movies/[id]
export async function POST(req: Request) {
  const body = await req.json();
  console.log(body)
  return NextResponse.json('Add movie to DB API route')
}

export async function PUT(req: Request) {
  const { imdbID } = await req.json();

  // search movie collection for a movie with matching imdbID,
  // Then update that record with info from a fresh omdbAPI request
  const result = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${imdbID}`).then((res: any) => res.json());
  let cleanResult: cleanMovieInfo | null = null;
  if (result.Response === 'True') {
    cleanResult = cleanUpMovieInfo(result);
  }
  if (cleanResult !== null) {
    await prisma.movies.update({
      where: {
        imdbID: cleanResult.imdbID,
      },
      data: {
        ...cleanResult,
      }
    })
    console.log(`SUCCESSFUL UPDATE OF MOVIE: ${cleanResult.Title}`)
    return NextResponse.json({ movieHasBeenUpdated: true })
  }
  return NextResponse.json({ movieHasBeenUpdated: false })
}
