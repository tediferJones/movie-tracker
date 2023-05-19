import { rawMovieInfo, cleanMovieInfo, ratingObj } from '@/types';
import { auth } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import AddToMyList from '@/components/AddToMyList';

export default async function Movie({ params }: { params: any }) {
  // Search for param ID in DB before fetching from omdbapi
  const { userId } = auth();
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
      <AddToMyList imdbId={data.imdbID} userId={userId}/>
    </div>
  )
}
