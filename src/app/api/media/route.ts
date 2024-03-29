import { NextResponse } from 'next/server';
import { strIdxRawMedia, strIdxMedia } from '@/types';
import cleanUpMediaInfo from '@/modules/cleanUpMediaInfo';
import easyFetch from '@/modules/easyFetch';
import prisma from '@/client';

export async function GET(req: Request) {
  console.log('\n FETCH SINGLE MOVIE RECORD FROM DB \n')
  const imdbID = new URL(req.url).searchParams.get('imdbID')
  let result = null;

  if (imdbID) {
    result = await prisma.media.findFirst({ where: { imdbID } })
  }

  return NextResponse.json(result, { status: result ? 200 : 404 })
}

export async function POST(req: Request) {
  const { imdbID } = await req.json();
  const rawData: strIdxRawMedia = await easyFetch('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbID,
  })

  if (rawData.Response === 'True') {
    const data: strIdxMedia = cleanUpMediaInfo(rawData);
    await prisma.media.create({ data });
    return NextResponse.json('\n Added movie to DB from /api/media \n')
  }

  return NextResponse.json('\n Failed to add movie to DB from /api/media \n')
}

export async function PUT(req: Request) {
  const { imdbID } = await req.json();
  const result = await easyFetch('https://www.omdbapi.com/', 'GET', {
    apikey: process.env.OMDBAPI_KEY,
    i: imdbID,
  })

  if (result.Response === 'True') {
    let data = cleanUpMediaInfo(result);
    await prisma.media.update({
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
