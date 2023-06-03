import { NextResponse } from 'next/server';
import { cleanMovieInfo, rawMovieInfo } from '@/types';
import cleanUpMovieInfo from '@/modules/cleanUpMovieInfo';
import easyFetch from '@/modules/easyFetch';
import prisma from '@/client';

export async function GET(req: Request) {
  console.log('\n FETCH SINGLE MOVIE RECORD FROM DB \n')
  const imdbID = new URL(req.url).searchParams.get('imdbID')
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

  const res = await easyFetch('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbID,
  })
  const rawData: rawMovieInfo = await res.json();
  if (rawData.Response === 'True') {
    const data: cleanMovieInfo = cleanUpMovieInfo(rawData);
    await prisma.movies.create({ data });
    return NextResponse.json('\n Added movie to DB from /api/movies \n')
  }
  return NextResponse.json('\n Failed to add movie to DB from /api/movies \n')
}

export async function PUT(req: Request) {
  const { imdbID } = await req.json();
  const res = await easyFetch('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbID,
  })
  const result = await res.json();

  if (result.Response === 'True') {
    let data = cleanUpMovieInfo(result);
    await prisma.movies.update({
      where: {
        imdbID: data.imdbID,
      },
      data,
    })
    console.log(`\n SUCCESSFUL UPDATE OF MOVIE: ${data.Title} \n`)
    return NextResponse.json({ movieHasBeenUpdated: true })
  }
  return NextResponse.json({ movieHasBeenUpdated: false })
}

export async function HEAD(req: Request) {
  // Return status code 200 if resource exists, return 404 if it doesnt exist
  const imdbID = new URL(req.url).searchParams.get('imdbID');
  console.log('\n HEAD REQUEST to /api/movies \n')
  let dbResult: Number;
  if (imdbID) {
    dbResult = await prisma.movies.count({ where: { imdbID } })
    return NextResponse.json({}, { status: dbResult === 0 ? 404 : 200 })
  }
  return NextResponse.json({}, { status: 400 })
}
