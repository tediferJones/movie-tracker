import { rawMovieInfo, cleanMovieInfo } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import AddToMyList from '@/components/AddToMyList';
import UpdateCachedMovie from '@/components/UpdateCachedMovie';
import prisma from '@/client';
import cleanUpMovieInfo from '@/modules/cleanUpMovieInfo';

export default async function Movie({ params }: { params: any }) {
  // Try to clean up and shorten/simplify these functions
  // start by extract id from params obj into imdbID, for easy access
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
  // const test = await fetch('/api/movies', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ imdbID })
  // })

  const newData: cleanMovieInfo | null = await prisma.movies.findFirst({ where: { imdbID } })
  // console.log('DATA FETCHED FROM THE DB')
  // console.log(newData);

  return (
    <div>
      {newData === null ? <h1>Error: Either the database or omdbAPI are not responding</h1> : 
      <>
        <h1>SINGLE MOVIE PAGE</h1>
        {Object.keys(newData).map((key: string) => {
          return (
            <div key={uuidv4()}>
              {`${key}: ${newData[key]}`}
            </div>
          )
        })}
        <img src={newData.Poster} />
        <AddToMyList imdbID={newData.imdbID}/>
        <div>{new Date(Number(newData.cachedAt)).toLocaleString()}</div>
        <UpdateCachedMovie imdbID={newData.imdbID}/>
      </>
      }
    </div>
  )
}
