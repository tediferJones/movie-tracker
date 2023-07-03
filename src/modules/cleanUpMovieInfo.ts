import { rawMediaInfo, cleanMediaInfo, ratingObj } from '@/types';

export default function cleanUpMovieInfo(movieObj: rawMediaInfo): cleanMediaInfo {
  // console.log(movieObj);

  // Delete all keys that dont contain any real data
  Object.keys(movieObj).forEach((key: string) => {
    if (movieObj[key] === 'N/A') {
      delete movieObj[key];
    }
  });

  // Extract ratings and put them in the root of the movieObj, instead of having an array of objects
  movieObj.Ratings?.forEach((ratingObj: ratingObj) => {
    let ratingValue: number = Number(ratingObj.Value.slice(0, ratingObj.Value.indexOf('/' || '%')));
    if (ratingObj.Source === 'Internet Movie Database') { 
      ratingObj.Source = 'IMDB';
      // All ratings are stored in the database as base 100, its essentially a percentage in integer form
      // But imdb ratings are out of 10 with step of 0.1, so just multiply by 10 to get an integer
      ratingValue = ratingValue * 10;
    }
    movieObj[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingValue;
  });

  // Split these strings into arrays of individual names
  ['Actors', 'Writer', 'Director', 'Genre', 'Country', 'Language']
      .forEach((key: string) => movieObj[key] = movieObj[key] ? movieObj[key].split(', ') : undefined);

  // Convert dates to UNIX time
  ['Released', 'DVD']
      .forEach((key: string) => movieObj[key] = movieObj[key] ? new Date(movieObj[key]).getTime() : undefined);

  // TESTING YEAR CONVERSION
  if (typeof(movieObj.Year) === 'string' && movieObj.Year.length > 4) {
    movieObj.endYear = Number(movieObj.Year.slice(5)) || undefined;
    movieObj.Year = Number(movieObj.Year.slice(0,4));
  } else {
    movieObj.Year = Number(movieObj.Year)
  }
 
  // Remove all non-numeric characters from string and convert to number
  ['imdbVotes', 'Runtime', 'BoxOffice', 'totalSeasons', 'Season', 'Episode']
      .forEach((key: string) => movieObj[key] = movieObj[key] ? Number(movieObj[key].replace(/\D/g, '')) : undefined);

  // Remove extranious or repetitive data
  ['Ratings', 'Metascore', 'imdbRating', 'Response']
      .forEach((key: string) => delete movieObj[key]);

  movieObj.cachedAt = Date.now();
  const cleanMovieObj: any = movieObj;
  return cleanMovieObj;
}
