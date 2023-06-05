import { rawMovieInfo, cleanMovieInfo, ratingObj } from '@/types';

export default function cleanUpMovieInfo(movieObj: rawMovieInfo): cleanMovieInfo {
  // Split these strings into arrays of individual names
  ['Actors', 'Writer', 'Director', 'Genre', 'Country', 'Language']
  .forEach((key: string) => movieObj[key] = movieObj[key].split(', '));
 
  ['Released', 'DVD'].forEach((key: string) => {
    movieObj[key] = movieObj[key] === 'N/A' ? 0 : new Date(movieObj[key]).getTime();
  });

  ['Year', 'imdbVotes', 'Runtime'].forEach((key: string) => {
    // Removes commas from imdbVotes, and remove units from runtime so they can be stored as integers
    // console.log(movieObj[key])
    movieObj[key] = movieObj[key] === 'N/A' ? 0 : Number(movieObj[key].replaceAll(',', '').replace(' min', ''))
    // console.log(movieObj[key])
  });

  // Extract ratings and put them in the root of the movieObj, instead of having an array of objects
  movieObj.Ratings?.forEach((ratingObj: ratingObj) => {
    let ratingValue: number = Number(ratingObj.Value.slice(0, ratingObj.Value.indexOf('/' || '%')));
    if (ratingObj.Source === 'Internet Movie Database') { 
      ratingObj.Source = 'IMDB';
      ratingValue = Number(ratingValue) * 10;
    }
    // console.log(ratingValue);
    movieObj[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingValue;
  });

  movieObj.cachedAt = Date.now();

  // Add 'N/A' for ratings that dont exist
  if (!movieObj.RottenTomatoesRating) movieObj.RottenTomatoesRating = 'N/A';
  if (!movieObj.MetacriticRating) movieObj.MetacriticRating = 'N/A';
  if (!movieObj.IMDBRating) movieObj.IMDBRating = 'N/A';

  delete movieObj.Ratings;
  delete movieObj.Metascore;
  delete movieObj.imdbRating;
  delete movieObj.Response;
  const cleanMovieObj: any = movieObj;

  return cleanMovieObj;
}
