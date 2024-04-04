export const formatRating: { [key: string]: (rating: number) => string } = {
  imdbRating: (rating) => rating ? `${(rating / 10).toFixed(1)}/10` : 'N/A',
  tomatoRating: (rating) => rating ? `${rating}%` : 'N/A',
  metaRating: (rating) => rating ? `${rating}/100` : 'N/A',
}

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

export function formatRuntime(mins: number) {
  const hours = Math.floor(mins / 60)
  return `${hours ? `${hours}h` : ''}${mins % 60}m`
}
