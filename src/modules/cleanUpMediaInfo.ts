import { strIdxRawMedia, ratingObj, strIdxMedia } from '@/types';

export default function cleanUpMediaInfo(mediaObj: strIdxRawMedia): strIdxMedia {
  // Delete all keys that dont contain any usable data
  Object.keys(mediaObj).forEach((key: string) => {
    if (mediaObj[key] === 'N/A') {
      delete mediaObj[key];
    }
  });

  // Extract ratings and put them in the root of the mediaObj, instead of having an array of objects
  mediaObj.Ratings?.forEach((ratingObj: ratingObj) => {
    let ratingValue: number = Number(ratingObj.Value.slice(0, ratingObj.Value.indexOf('/' || '%')));
    if (ratingObj.Source === 'Internet Movie Database') { 
      ratingObj.Source = 'IMDB';
      // All ratings are stored in the database as base 100, its essentially a percentage in integer form
      // But imdb ratings are out of 10 with step of 0.1, so just multiply by 10 to get an integer
      ratingValue = ratingValue * 10;
    }
    mediaObj[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingValue;
  });

  // Split these strings into arrays of individual names
  ['Actors', 'Writer', 'Director', 'Genre', 'Country', 'Language']
      .forEach((key: string) => mediaObj[key] = mediaObj[key] ? mediaObj[key].split(', ') : undefined);

  // Convert dates to UNIX time
  ['Released', 'DVD']
      .forEach((key: string) => mediaObj[key] = mediaObj[key] ? new Date(mediaObj[key]).getTime() : undefined);

  // TESTING YEAR CONVERSION
  if (typeof(mediaObj.Year) === 'string' && mediaObj.Year.length > 4) {
    mediaObj.endYear = Number(mediaObj.Year.slice(5)) || undefined;
    mediaObj.Year = Number(mediaObj.Year.slice(0,4));
  } else {
    mediaObj.Year = Number(mediaObj.Year)
  }
 
  // Remove all non-numeric characters from string and convert to number
  ['imdbVotes', 'Runtime', 'BoxOffice', 'totalSeasons', 'Season', 'Episode']
      .forEach((key: string) => mediaObj[key] = mediaObj[key] ? Number(mediaObj[key].replace(/\D/g, '')) : undefined);

  // Remove extranious or repetitive data
  ['Ratings', 'Metascore', 'imdbRating', 'Response']
      .forEach((key: string) => delete mediaObj[key]);

  mediaObj.cachedAt = Date.now();
  const cleanMovieObj: any = mediaObj;
  return cleanMovieObj;
}
