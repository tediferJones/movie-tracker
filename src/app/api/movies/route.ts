import { NextResponse } from 'next/server';
import { cleanMovieInfo, rawMovieInfo } from '@/types';
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

export async function POST(req: Request) {
  const { imdbID } = await req.json();
  // console.log(imdbID)
  const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${imdbID}`);
  const rawData: rawMovieInfo = await res.json();
  if (rawData.Response === 'True') {
    const data: cleanMovieInfo = cleanUpMovieInfo(rawData);
    await prisma.movies.create({ data });
    return NextResponse.json('Added movie to DB API route')
  }
  return NextResponse.json('Failed to add movie to DB API route')
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

export async function HEAD(req: Request) {
  // Return status code 200 if resource exists, return 404 if it doesnt exist
  const { searchParams } = new URL(req.url);
  const imdbID = searchParams.get('imdbID');
  console.log(imdbID)
  let dbResult: Number;
  if (imdbID) {
    dbResult = await prisma.movies.count({ where: { imdbID } })
    return NextResponse.json({}, { status: dbResult === 0 ? 404 : 200 })
  }
  return NextResponse.json({}, { status: 400 })
}
