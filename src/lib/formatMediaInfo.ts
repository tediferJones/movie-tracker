import { ratingObj, strIdxRawMedia } from '@/types';

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

export default function formatMediaInfo(info: strIdxRawMedia) {
  // const formatter: { [key: string]: { key: string, data?: (str: string) => any } } = {
  //   Title: { key: 'title' },
  //   Year: { key: 'year', data: (val) => Number(val) }
  // }

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

  // const formatterV3 = new Map<string[], any>([
  //   [['year', 'runtime', 'imdbVotes', 'boxOffice'], toNumber],
  //   [['released', 'dvd'], toDate],
  //   [['genre', 'director', 'writer', 'actors', 'language', 'country'], toArray],
  // ])

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

    if (newKey === 'ratings') {
      const oldRatings: ratingObj[] = info[oldKey]
      return {
        ...newObj,
        ...oldRatings.reduce((newObj, key) => {
          const ratingFixer = getRating[key.Source]
          newObj[ratingFixer.key] = ratingFixer.rating(key.Value)
          return newObj
        }, {} as { [key: string]: number })
      }
    }

    const newData = formatterV2?.[newKey]?.(info[oldKey]) || info[oldKey];
    newObj[newKey] = newData
    return newObj
  }, {} as { [key: string]: any })
  // return formatted
  const { genre, director, writer, actor, country, language, ...rest } = formatted
  const imdbId = formatted.imdbId
  const people: { [key: string]: string[] } = { director, writer, actor }
  return {
    mediaInfo: rest,
    genres: genre.map((genre: string) => ({ imdbId, genre })),
    countries: country.map((country: string) => ({ imdbId, country })),
    languages: language.map((language: string) => ({ imdbId, language })),
    people: Object.keys(people).reduce((arr, position) => {
      if (!people[position]) return arr
      return arr.concat(
        people[position].map(name => ({ imdbId, position, name }))
      )
    }, [] as { name: string, imdbId: string, position: string }[])
  };
}
