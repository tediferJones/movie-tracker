import { media, people } from '@/drizzle/schema';
import getTypedKeys from '@/lib/getTypedKeys';
import { FormattedMediaInfo, RatingObj, StrIdxRawMedia } from '@/types';

type PeopleInsert = typeof people.$inferInsert

const skipKeys = ['imdbRating', 'metascore', 'response'];

const formatterV2: { [key: string]: (str: string) => any } = {
  // It would probably be beneficial to use a map instead of an obj
  // This way we can format like so:
  // [Array of keys]: Function
  // If key in array, run function
  year: (val) => toNumber(val),
  runtime: (val) => toNumber(val),
  imdbVotes: (val) => toNumber(val),
  boxOffice: (val) => toNumber(val),
  totalSeasons: (val) => toNumber(val),
  season: (val) => toNumber(val),
  episode: (val) => toNumber(val),

  released: (val) => toDate(val),
  dvd: (val) => toDate(val),

  genre: val => toArray(val),
  director: val => toArray(val),
  writer: val => toArray(val),
  actor: val => toArray(val),
  language: val => toArray(val),
  country: val => toArray(val),
}

const getRating: { [key: string]: { key: string, rating: (str: string) => number } } = {
  'Internet Movie Database': {
    key: 'imdbRating',
    rating: (val) => Number(val.slice(0, val.indexOf('/'))) * 10,
  },
  'Rotten Tomatoes': {
    key: 'tomatoRating',
    rating: (val) => Number(val.slice(0, val.indexOf('%'))),
  },
  'Metacritic': {
    key: 'metaRating',
    rating: (val) => Number(val.slice(0, val.indexOf('/'))),
  },
}

const specialPascal: { [key: string]: string } = {
  DVD: 'dvd',
  imdbID: 'imdbId',
  seriesID: 'seriesId',
  Actors: 'actor'
}


function toCamelCase(pascalStr: string) {
  return specialPascal[pascalStr] ||
    pascalStr[0].toLowerCase() + pascalStr.slice(1);
}

function toNumber(str: string) {
  return Number(
    [...str.matchAll(/\d+/g)].reduce((str, match) => str + match[0], '')
  );
}

function toArray(str: string) {
  return str.split(', ');
}

function toDate(str: string) {
  return new Date(str).getTime();
}

function formatYear(year: string) {
  const splitIndex = year.indexOf('–'); // THIS CHAR IS NOT A NORMAL - (i.e. minus symbol)
  return {
    startYear: Number(
      splitIndex >= 0 ? year.slice(0, splitIndex) : year.slice(0, 4)
    ),
    endYear: splitIndex >= 0 ? Number(year.slice(splitIndex + 1)) : null,
  }
}

// FIX ME, refactor this
export default function formatMediaInfo(
  info: StrIdxRawMedia
): FormattedMediaInfo {
  const formatted = getTypedKeys(info).reduce((newObj, oldKey) => {
    const newKey = toCamelCase(oldKey);
    if (info[oldKey] !== 'N/A' && !skipKeys.includes(newKey)) {
      if (formatterV2[newKey]) {
        newObj[newKey] = formatterV2[newKey](info[oldKey] as string);
      } else {
        newObj[newKey] = info[oldKey];
      }
    }
    return newObj;
  }, {} as { [key: string]: any });

  const {
    genre,
    director,
    writer,
    actor,
    country,
    language,
    ratings,
    year,
    ...rest
  } = formatted;

  const imdbId: string = formatted.imdbId;
  const positions: { [key: string]: string[] } = { director, writer, actor };
  const people = Object.keys(positions).reduce((arr, position) => {
    if (!positions[position]) return arr;
    return arr.concat(
      positions[position].map(name => ({ imdbId, position, name }))
    );
  }, [] as PeopleInsert[]);

  return {
    mediaInfo: {
      ...rest,
      ...(ratings as RatingObj[]).reduce((newObj, key) => {
        const ratingFixer = getRating[key.Source];
        newObj[ratingFixer.key] = ratingFixer.rating(key.Value);
        return newObj;
      }, {} as { [key: string]: number }),
      ...formatYear(info.Year),
      updatedAt: Date.now(),
    } as typeof media.$inferInsert,
    genres: genre?.map((genre: string) => ({ imdbId, genre })),
    countries: country?.map((country: string) => ({ imdbId, country })),
    languages: language?.map((language: string) => ({ imdbId, language })),
    people: people.length ? people : undefined,
  }
}

type Formatter = { keys: string[], func: (arg: string) => any }
const formatterV3: Formatter[] = [
  {
    keys: [
      'runtime',
      'imdbVotes',
      'boxOffice',
      'totalSeasons',
      'season',
      'episode',
    ],
    func: (str) => {
      return Number(
        [...str.matchAll(/\d+/g)]
          .reduce((str, match) => str + match[0], '')
      );
    },
  }, {
    keys: [
      'released',
      'dvd',
    ],
    func: (str) => new Date(str).getTime(),
  }, {
    keys: [
      'actor',
      'writer',
      'director',
      'genre',
      'language',
      'country',
    ],
    func: (str) => str.split(', '),
  },
];

function format(info: StrIdxRawMedia) {
  return getTypedKeys(info).reduce((newObj, oldKey) => {
    const newKey = toCamelCase(oldKey);
    if (info[oldKey] !== 'N/A' || !skipKeys.includes(newKey)) {
      const formatter = formatterV3.find(obj => obj.keys.includes(newKey));
      if (formatter) {
        newObj[newKey] = formatter.func(info[oldKey] as string);
      } else {
        newObj[newKey] = info[oldKey];
      }
    }
    return newObj;
  }, {} as { [key: string]: any });
}

type Categories = 'genre' | 'country' | 'language'
function addImdbId<K extends Categories>(
  arr: string[],
  imdbId: string,
  category: K
): ({ [P in K]: string } & { imdbId: string })[] {
  return arr.map(str => ({ [category]: str, imdbId })) as any;
}

type Positions = 'actor' | 'writer' | 'director'
function formatPeople(names: string[], position: Positions, imdbId: string) {
  return names.map(name => ({ name, position, imdbId }));
}

function formatRatings(ratings: RatingObj[]) {
  return ratings.reduce((newObj, key) => {
    const ratingFixer = getRating[key.Source];
    newObj[ratingFixer.key] = ratingFixer.rating(key.Value);
    return newObj;
  }, {} as { [key: string]: number });
}

// FIX ME
// Try to make this more strongly typed
// Mainly to get rid of casting in return statement
function formatMediaInfoV2(info: StrIdxRawMedia): FormattedMediaInfo {
  const formatted = format(info);

  const {
    genre,
    director,
    writer,
    actor,
    country,
    language,
    ratings,
    year,
    ...rest
  } = formatted;

  const imdbId: string = formatted.imdbId;

  return {
    mediaInfo: {
      ...rest,
      ...formatYear(year),
      ...formatRatings(ratings),
      updatedAt: Date.now(),
    } as typeof media.$inferInsert, // this is risky business
    genres: addImdbId(genre, imdbId, 'genre'),
    countries: addImdbId(country, imdbId, 'country'),
    languages: addImdbId(language, imdbId, 'language'),
    // this can almost certainly be simplified
    people: [
      ...formatPeople(actor, 'actor', imdbId),
      ...formatPeople(writer, 'writer', imdbId),
      ...formatPeople(director, 'director', imdbId),
    ],
  };
}
