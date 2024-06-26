import { media, people } from '@/drizzle/schema';
import { FormattedMediaInfo, RatingObj, StrIdxRawMedia } from '@/types';
type PeopleInsert = typeof people.$inferInsert;

function toCamelCase(pascalStr: string) {
  if (pascalStr === 'DVD') return 'dvd'
  if (pascalStr === 'imdbID') return 'imdbId'
  if (pascalStr === 'seriesID') return 'seriesId'
  if (pascalStr === 'Actors') return 'actor'
  return pascalStr[0].toLowerCase() + pascalStr.slice(1);
}

function toNumber(str: string) {
  return Number(
    [...str.matchAll(/\d+/g)]
      .reduce((str, match) => str + match[0], '')
  )
}

function toArray(str: string) {
  return str.split(', ')
}

function toDate(str: string) {
  return new Date(str).getTime()
}

export default function formatMediaInfo(info: StrIdxRawMedia): FormattedMediaInfo {
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
      rating: (val) => Number(val.slice(0, val.indexOf('%')))
    },
    'Metacritic': {
      key: 'metaRating',
      rating: (val) => Number(val.slice(0, val.indexOf('/'))),
    }
  }

  const formatted = Object.keys(info).reduce((newObj, oldKey) => {
    const newKey = toCamelCase(oldKey)
    if (info[oldKey] === 'N/A' || ['imdbRating', 'metascore', 'response'].includes(newKey)) return newObj;
    newObj[newKey] = formatterV2?.[newKey]?.(info[oldKey]) || info[oldKey];
    return newObj
  }, {} as { [key: string]: any })

  function formatYear(year: string) {
    const splitIndex = year.indexOf('–') // THIS CHAR IS NOT A NORMAL - (i.e. minus symbol)
    return {
      startYear: Number(splitIndex >= 0 ? year.slice(0, splitIndex) : year.slice(0, 4)),
      endYear: splitIndex >= 0 ? Number(year.slice(splitIndex + 1)) : null,
    }
  }

  const { genre, director, writer, actor, country, language, ratings, year, ...rest } = formatted;
  const imdbId: string = formatted.imdbId;
  const positions: { [key: string]: string[] } = { director, writer, actor };
  const people = Object.keys(positions).reduce((arr, position) => {
      if (!positions[position]) return arr
      return arr.concat(positions[position].map(name => ({ imdbId, position, name })))
    }, [] as PeopleInsert[])

  return {
    mediaInfo: {
      ...rest,
      ...(ratings as RatingObj[]).reduce((newObj, key) => {
        const ratingFixer = getRating[key.Source]
        newObj[ratingFixer.key] = ratingFixer.rating(key.Value)
        return newObj
      }, {} as { [key: string]: number }),
      ...formatYear(info.Year),
      updatedAt: Date.now(),
    } as typeof media.$inferInsert,
    genres: genre?.map((genre: string) => ({ imdbId, genre })),
    countries: country?.map((country: string) => ({ imdbId, country })),
    languages: language?.map((language: string) => ({ imdbId, language })),
    people: people.length ? people : undefined,
  };
}
