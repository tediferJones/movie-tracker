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
  // Dont write api routes, this page is rendered entirely on the server, so we can safely modify the DB from here
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
    // THE BELOW COMMAND WORKS, BUT WE NEED TO CLEAN UP OUR DATA A LITTLE BIT MORE
    // when we extract ratings obj, not all values needed by the DB may be present
    // Example: The Deluge 1974 has no ratings for rottenTomatoes or Metacritic
    // SOLUTION: either manually add fields that dont exists
    //    if (data.RottenTomatoesRating === undefined) { data.RottenTomatoesRating = 'Not Available' }
    // OR you could make a ratings table similar to people table but would require another foreign key

    // const insertMovie = await prisma.$queryRaw
    //     `INSERT INTO movies 
    //     (title, year, rated, 
    //     released, plot, language, 
    //     country, awards, poster, 
    //     imdbId, type, dvd, 
    //     boxOffice, production, website, 
    //     imdbRating, rottenTomatoesRating, metacriticRating)
    //     VALUES
    //     (${cleanOmdbResult.Title}, ${cleanOmdbResult.Year}, ${cleanOmdbResult.Rated}, 
    //     ${cleanOmdbResult.Released}, ${cleanOmdbResult.Plot}, ${cleanOmdbResult.Language}, 
    //     ${cleanOmdbResult.Country}, ${cleanOmdbResult.Awards}, ${cleanOmdbResult.Poster}, 
    //     ${cleanOmdbResult.imdbID}, ${cleanOmdbResult.Type}, ${cleanOmdbResult.DVD}, 
    //     ${cleanOmdbResult.BoxOffice}, ${cleanOmdbResult.Production}, ${cleanOmdbResult.Website}, 
    //     ${cleanOmdbResult.IMDBRating}, ${cleanOmdbResult.RottenTomatoesRating}, ${cleanOmdbResult.MetacriticRating})`
    // console.log(insertMovie);

    // This works, and proves that foreign key constraints do not exist in prisma and/or planetScale
    // const dbTest = await prisma.$queryRaw`INSERT INTO genres (genre, movieId) VALUES ('exampleGenre2', 2)`
    // console.log(dbTest);
  }

  console.log('poopoodoodoo')
  const res = await fetch(`https://www.omdbapi.com/?apikey=8e1df54b&i=${params.id}`)
  const rawData: rawMovieInfo = await res.json();
  const data: cleanMovieInfo = cleanUpMovieInfo(rawData);

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
