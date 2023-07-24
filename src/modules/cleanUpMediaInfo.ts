import { strIdxRawMedia, ratingObj, strIdxMedia } from '@/types';

type dataType = {
  keys: string[],
  convert: Function,
}

type conversions = {
  [key: string]: dataType,
}

export default function cleanUpMediaInfo(rawMedia: strIdxRawMedia): strIdxMedia {
  const conversions: conversions = {
    array: {
      keys: ['Actors', 'Writer', 'Director', 'Genre', 'Country', 'Language'],
      convert: (key: string) => rawMedia[key].split(', '),
    },
    date: {
      keys: ['Released', 'DVD'],
      convert: (key: string) => new Date(rawMedia[key]).getTime(),
    },
    number: {
      keys: ['imdbVotes', 'Runtime', 'BoxOffice', 'totalSeasons', 'Season', 'Episode'],
      convert: (key: string) => Number(rawMedia[key].replace(/\D/g, '')),
    },
    string: {
      keys: ['Title', 'imdbID', 'Type', 'Poster', 'Rated', 'Plot', 'Awards', 'Production', 'Website'],
      convert: (key: string) => rawMedia[key],
    },
    year: {
      keys: ['Year'],
      convert: (key: string) => {
        if (rawMedia[key].length > 5) {
          cleanMedia['end' + key] = Number(rawMedia[key].slice(5));
        }
        return Number(rawMedia[key].slice(0, 4));
      },
    },
  };

  let cleanMedia = {} as strIdxMedia;
  Object.keys(conversions).forEach((dataType: string) => {
    conversions[dataType].keys.forEach((key: string) => {
      rawMedia[key] && rawMedia[key] !== 'N/A' ? cleanMedia[key] = conversions[dataType].convert(key) : undefined;
    })
  });

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

  cleanMedia.cachedAt = Date.now();

  return cleanMedia;
}
