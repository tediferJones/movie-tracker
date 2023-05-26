import { rawMovieInfo, cleanMovieInfo } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import AddToMyList from '@/components/AddToMyList';
import UpdateCachedMovie from '@/components/updateCachedMovie';
import prisma from '@/client';
import cleanUpMovieInfo from '@/modules/cleanUpMovieInfo';

export default async function Movie({ params }: { params: any }) {
  // Try to clean up and shorten/simplify these functions
  // start by extract id from params obj into imdbID, for easy access
  // Also go into prisma schema file and make the appropiate fields unique (like imdbId, and probably title too)
  const dbCount = await prisma.movie.count({ where: { imdbID: params.id } })

  if (dbCount === 0) {
    // const test: cleanMovieInfo = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`).then((res: any) => res.json());
    const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`);
    const rawData: rawMovieInfo = await res.json();
    const data: cleanMovieInfo = cleanUpMovieInfo(rawData);
    await prisma.movie.create({ data });
  }

  const newData: cleanMovieInfo | null = await prisma.movie.findFirst({ where: { imdbID: params.id } })
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
        {/* WE CHANGE THE SPELLING OF imdbId HERE, FIX IT, either rename the original value, or rename all proceeding references to imdbId */}
        <AddToMyList imdbId={newData.imdbID}/>
        <div>{new Date(Number(newData.cachedAt)).toLocaleString()}</div>
        <UpdateCachedMovie imdbID={newData.imdbID}/>
      </>
      }
    </div>
  )
}
