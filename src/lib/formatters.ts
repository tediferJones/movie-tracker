const camelCaseOverride: { [key: string]: string } = {
  seriesId: 'Series',
  imdbRating: 'IMDB',
  metaRating: 'Meta',
  tomatoRating: 'Tomato',
  startYear: 'Year'
}

export function fromCamelCase(str: string, isPlural?: boolean) {
  if (camelCaseOverride[str]) return camelCaseOverride[str]
  return str.split('').reduce((str, char, i) => {
    if (i === 0) return char.toUpperCase();
    if ('A' <= char && char <= 'Z') return `${str} ${char}`;
    return str + char;
  }, '') + (isPlural ? 's' : '')
}

export const formatRating: { [key: string]: (rating: number) => string } = {
  imdbRating: (rating) => rating ? `${(rating / 10).toFixed(1)}/10` : 'N/A',
  tomatoRating: (rating) => rating ? `${rating}%` : 'N/A',
  metaRating: (rating) => rating ? `${rating}/100` : 'N/A',
}

export function formatRuntime(mins: number) {
  const hours = Math.floor(mins / 60)
  return `${hours ? `${hours}h` : ''}${mins % 60}m`
}

export const getKeyFormatter: { [key: string]: Function } = {
  imdbRating: formatRating.imdbRating,
  metaRating: formatRating.metaRating,
  tomatoRating: formatRating.tomatoRating,
  runtime: formatRuntime,
}

export const keyToLink: { [key: string]: string } = {
  director: 'people',
  writer: 'people',
  actor: 'people',
  genre: 'genres',
  country: 'countries',
  language: 'languages',
}

export const tableToCol : { [key: string]: string } = {
  genres: 'genre',
  countries: 'country',
  languages: 'language',
  people: 'name',
  users: 'username',
}
