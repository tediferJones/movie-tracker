import { strIdxRawMedia, ratingObj, strIdxMedia } from '@/types';

export default function cleanUpMediaInfo(rawMedia: strIdxRawMedia): strIdxMedia {
  function keyExists(key: string): boolean {
    return rawMedia[key] && rawMedia[key] !== 'N/A';
  }

  let cleanMedia = {} as strIdxMedia;

  // Split these strings into arrays of individual names
  ['Actors', 'Writer', 'Director', 'Genre', 'Country', 'Language']
      .forEach((key: string) => keyExists(key) ? cleanMedia[key] = rawMedia[key].split(', ') : undefined);

  // Convert dates to UNIX time
  ['Released', 'DVD']
      .forEach((key: string) => keyExists(key) ? cleanMedia[key] = new Date(rawMedia[key]).getTime() : undefined);

  // Remove all non-numeric characters from string and convert to number
  ['imdbVotes', 'Runtime', 'BoxOffice', 'totalSeasons', 'Season', 'Episode']
    .forEach((key: string) => keyExists(key) ? cleanMedia[key] = Number(rawMedia[key].replace(/\D/g, '')) : undefined);
 
  // No conversion needed
  ['Title', 'imdbID', 'Type', 'Poster', 'Rated', 'Plot', 'Awards', 'Production', 'Website']
    .forEach((key: string) => keyExists(key) ? cleanMedia[key] = rawMedia[key] : undefined)

  // Extract ratings and put them in the root of cleanMedia
  rawMedia.Ratings?.forEach((ratingObj: ratingObj) => {
    let ratingValue = Number(ratingObj.Value.slice(0, ratingObj.Value.indexOf('/' || '%')));
    if (ratingObj.Source === 'Internet Movie Database') { 
      ratingObj.Source = 'IMDB';
      // IMDBRating needs to be multiplied by 10 so all rating in the database are rated out of 100
      ratingValue = ratingValue * 10;
    }
    cleanMedia[`${ratingObj.Source} Rating`.replaceAll(' ', '')] = ratingValue;
  });

  // If year is formatted as '2004-2008', then Year=2004 and endYear=2008
  if (rawMedia.Year.includes('\u2013')) { 
    const splitAt = rawMedia.Year.indexOf('\u2013')
    cleanMedia.Year = Number(rawMedia.Year.slice(0, splitAt));
    if (rawMedia.Year.slice(splitAt + 1)) {
      cleanMedia.endYear = Number(rawMedia.Year.slice(splitAt + 1));
    }
  } else {
    cleanMedia.Year = Number(rawMedia.Year);
  }

  cleanMedia.cachedAt = Date.now();

  return cleanMedia;
}
