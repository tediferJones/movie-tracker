import { rawMovieInfo, cleanMovieInfo, ratingObj } from '@/types';

export default function cleanUpMovieInfo(movieObj: rawMovieInfo): cleanMovieInfo {
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
