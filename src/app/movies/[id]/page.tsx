import { rawMovieInfo, cleanMovieInfo, ratingObj } from '@/types';
// import { auth } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import AddToMyList from '@/components/AddToMyList';
import prisma from '@/client';

export default async function Movie({ params }: { params: any }) {
  // Search for param ID in DB before fetching from omdbapi
  // const { userId } = auth();
  // Whats the process we need each movie page to go through?
  //   - First check if the movie exists in the DB
  //   - if it does, display those results
  //   - if it does NOT, fetch it from omdb and add it to our DB, then display that result
  //        - add the date added field to the cleanMovieInfo obj, add it to the types file too
  // What API routes do we need?
  //   - GET returns array of single movie obj from DB or empty array
  //        /api/movies?{imdbId}
  //   - POST add movie data to DB
  //        /api/movies body = cleanMovieInfo obj

  // Check if movie already exists in our DB, otherwise fetch from omdbapi and add to our DB
  // STEP 1: WRITE THE API ROUTES
  let dataV2: cleanMovieInfo;
  const dbResult: cleanMovieInfo[] = await prisma.$queryRaw
      `SELECT * FROM movies WHERE imdbId = ${params.id}`
  console.log(dbResult)
  if (dbResult.length === 1) {
    dataV2 = dbResult[0];
  } else {
    const omdbResult = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`).then((res: any) => res.json());
    const cleanOmdbResult = cleanUpMovieInfo(omdbResult);
    console.log(cleanOmdbResult);
    // prisma.$queryRaw`INSERT INTO movies ()`
  }

  const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`)
  const rawData: rawMovieInfo = await res.json();
  const data: cleanMovieInfo = cleanUpMovieInfo(rawData);
  console.log('poopoodoodoo')

  function cleanUpMovieInfo(movieObj: rawMovieInfo): cleanMovieInfo {
    // Split these strings into arrays of individual names
    ['Actors', 'Writer', 'Director', 'Genre']
        .forEach((key: string) => movieObj[key] = movieObj[key].split(', '))

    movieObj.Ratings?.forEach((ratingObj: ratingObj) => {
      if (ratingObj.Source === 'Internet Movie Database') { ratingObj.Source = 'IMDB' }
      movieObj[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingObj.Value
    })

    delete movieObj.Ratings;
    delete movieObj.Metascore;
    delete movieObj.imdbRating;
    delete movieObj.imdbVotes;
    delete movieObj.Response;
    const cleanMovieObj: any = movieObj;

    return cleanMovieObj;
  }

  // This is where we add the movie to our account's list
  //    - Check the DB movie list, if it already exists, just link to that ID or whatever
  //    - If it doesn't exist, add it to our db movie list
  //
  // With the above in mind, we should probably have an indicator on each page to show if the data being shown is from the DB, or omdbAPI
  // you should probably add a custom field for 'cachedResult' with a value of the current date
  // ADD AN UPDATE BUTTON, when pressed it will fetch a new copy of the movie

  // userId={userId}

  return (
    <div>
      <h1>SINGLE MOVIE PAGE</h1>
      {Object.keys(data).map((key: string) => {
        return (
          <div key={uuidv4()}>
            {`${key}: ${data[key]}`}
          </div>
        )
      })}
      <img src={data.Poster} />
      <button className='p-4 bg-gray-200'>Update Results (if its cached)</button>
      {/* WE CHANGE THE SPELLING OF imdbId HERE, FIX IT, either rename the original value, or rename all proceeding references to imdbId */}
      <AddToMyList imdbId={data.imdbID}/>
    </div>
  )
}
