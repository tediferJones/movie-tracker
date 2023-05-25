import { rawMovieInfo, cleanMovieInfo, ratingObj } from '@/types';
// import { auth } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import AddToMyList from '@/components/AddToMyList';
import prisma from '@/client';

export default async function Movie({ params }: { params: any }) {
  // Try to clean up and shorten/simplify these functions
  // start by extract id from params obj into imdbID, for easy access
  // Also go into prisma schema file and make the appropiate fields unique (like imdbId, and probably title too)
  const dbCount = await prisma.movie.count({ 
    where: { imdbID: params.id } 
  })
  console.log(`THIS IS THE RECORD COUNT ${dbCount}`)

  if (dbCount === 0) {
    // const test: cleanMovieInfo = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`).then((res: any) => res.json());
    const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`);
    const rawData: rawMovieInfo = await res.json();
    const data: cleanMovieInfo = cleanUpMovieInfo(rawData);
    await prisma.movie.create({ data, });
  }

  const newData: cleanMovieInfo | null = await prisma.movie.findFirst({ where: { imdbID: params.id } })
  console.log('DATA FETCHED FROM THE DB')
  console.log(newData);

  function cleanUpMovieInfo(movieObj: rawMovieInfo): cleanMovieInfo {
    // Split these strings into arrays of individual names
    ['Actors', 'Writer', 'Director', 'Genre']
        .forEach((key: string) => movieObj[key] = movieObj[key].split(', '))

    movieObj.Ratings?.forEach((ratingObj: ratingObj) => {
      if (ratingObj.Source === 'Internet Movie Database') { ratingObj.Source = 'IMDB' }
      movieObj[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingObj.Value
    })

    movieObj.cachedAt = Date.now().toString();

    // Add 'N/A' for ratings that dont exist
    if (!movieObj.RottenTomatoesRating) movieObj.RottenTomatoesRating = 'N/A';
    if (!movieObj.MetacriticRating) movieObj.MetacriticRating = 'N/A';

    delete movieObj.Ratings;
    delete movieObj.Metascore;
    delete movieObj.imdbRating;
    // delete movieObj.imdbVotes;
    delete movieObj.Response;
    const cleanMovieObj: any = movieObj;

    return cleanMovieObj;
  }

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
        <button className='p-4 bg-gray-200'>Update Results (if its cached)</button>
        {/* WE CHANGE THE SPELLING OF imdbId HERE, FIX IT, either rename the original value, or rename all proceeding references to imdbId */}
        <AddToMyList imdbId={newData.imdbID}/>
      </>
      }
    </div>
  )
}
