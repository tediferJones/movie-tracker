import { rawMovieInfo, cleanMovieInfo, ratingObj } from '@/types';

export default function cleanUpMovieInfo(movieObj: rawMovieInfo): cleanMovieInfo {
  // Split these strings into arrays of individual names
  ['Actors', 'Writer', 'Director', 'Genre', 'Country', 'Language']
      .forEach((key: string) => movieObj[key] = movieObj[key].split(', '));
 
  ['Released', 'DVD'].forEach((key: string) => {
    movieObj[key] = movieObj[key] === 'N/A' ? 0 : new Date(movieObj[key]).getTime();
  });

  ['Year', 'imdbVotes', 'Runtime', 'BoxOffice'].forEach((key: string) => {
    // Remove units and commas so we can convert these strings to integers
    movieObj[key] = movieObj[key] === 'N/A' ? 0 :
      Number(movieObj[key].replaceAll(',', '').replace(' min', '').replace('$', ''))
  });

  // Extract ratings and put them in the root of the movieObj, instead of having an array of objects
  movieObj.Ratings?.forEach((ratingObj: ratingObj) => {
    let ratingValue: number = Number(ratingObj.Value.slice(0, ratingObj.Value.indexOf('/' || '%')));
    if (ratingObj.Source === 'Internet Movie Database') { 
      ratingObj.Source = 'IMDB';
      ratingValue = ratingValue * 10;
    }
    // console.log(ratingValue);
    movieObj[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingValue;
  });

  // Assign 0 to every rating that was not found in movieObj.Ratings
  ['RottenTomatoesRating', 'MetacriticRating', 'IMDBRating']
      .forEach((key: string) => movieObj[key] === undefined ? movieObj[key] = 0 : undefined);
 
  ['Ratings', 'Metascore', 'imdbRating', 'Response']
      .forEach((key: string) => delete movieObj[key]);

  movieObj.cachedAt = Date.now();
  const cleanMovieObj: any = movieObj;
  return cleanMovieObj;
}
