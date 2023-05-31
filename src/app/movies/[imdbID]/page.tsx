import { rawMovieInfo, cleanMovieInfo } from '@/types';
import DisplayFullMovieInfo from '@/components/DisplayFullMovieInfo';
import prisma from '@/client';
import cleanUpMovieInfo from '@/modules/cleanUpMovieInfo';

export default async function Movie({ params }: { params: any }) {
  // Try to clean up and shorten/simplify these functions
  // Also go into prisma schema file and make the appropiate fields unique (like imdbId, and probably title too)
  const { imdbID } = params;
  const dbCount = await prisma.movies.count({ where: { imdbID } })

  if (dbCount === 0) {
    // const test: cleanMovieInfo = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`).then((res: any) => res.json());
    const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${imdbID}`);
    const rawData: rawMovieInfo = await res.json();
    const data: cleanMovieInfo = cleanUpMovieInfo(rawData);
    await prisma.movies.create({ data });
  }

  // YOU CAN USE FIND AND MAYBE COUNT HERE,
  // BUT ALL CRUD operations should be done in API routes

  // newData should be a fetch request to api/movies
  // Everything above this line should be moved to that api route, the checking of count, inserting of the new record, and returning of the db content

  // cant fetch from the server, would have to do this client side
  const newData: cleanMovieInfo | null = await prisma.movies.findFirst({ where: { imdbID } })
  // console.log('DATA FETCHED FROM THE DB')
  // console.log(newData);

  // What happens when a user goes to /movies/notAnImdbID

  return (
    <div>
      {newData === null ? <h1>Error: Either the database or omdbAPI are not responding</h1> : 
      <>
        <h1>SINGLE MOVIE PAGE</h1>
        <DisplayFullMovieInfo imdbID={newData.imdbID} />
      </>
      }
    </div>
  )
}
