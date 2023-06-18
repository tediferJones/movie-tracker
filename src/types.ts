interface stringIndexableObject {
  [key: string]: any,
}

interface ratingObj {
  Source: string,
  Value: string,
}

interface basicMovieInfo extends stringIndexableObject {
  Title: string,
  Rated: string,
  Plot: string,
  Awards: string,
  Poster: string,
  imdbID: string,
  Type: string,
  Production: string,
  Website: string,
}

interface rawMediaInfo extends basicMovieInfo {
  Genre: string,
  Director: string,
  Writer: string,
  Actors: string,
  // Add dirty rating obj here
  Ratings?: ratingObj[],
  Metascore?: string,
  imdbRating?: string,
  Released: string | number,
  DVD: string | number,
  Year: string | number,
  imdbVotes: string | number,
  Runtime: string | number,
  Country: string,
  Language: string,
  BoxOffice: string | number,
  Response?: string,
  IMDBRating?: number,
  RottenTomatoesRating?: number,
  MetacriticRating?: number,
  cachedAt?: number,
  totalSeasons?: string | number,
  Season?: string | number,
  Episode?: string | number,
}

interface cleanMediaInfo extends basicMovieInfo {
  Genre: string[],
  Director: string[],
  Writer: string[],
  Actors: string[],
  // Add extracted rating data here
  IMDBRating: number,
  RottenTomatoesRating: number,
  MetacriticRating: number,
  cachedAt: number,
  Released: number,
  DVD: number,
  Year: number,
  imdbVotes: number,
  Runtime: number,
  Country: string[],
  Language: string[],
  BoxOffice: number,
  totalSeasons?: number,
  Season?: number,
  Episode?: number,
}

interface omdbSearchResult {
  Poster: string,
  Title: string,
  Type: string,
  Year: string,
  imdbID: string,
}

interface omdbSearch {
  Response: string,
  Search: omdbSearchResult[],
  totalResults: string,
}

interface review extends stringIndexableObject {
  username: string,
  imdbID: string,
  watchAgain: boolean,
  myRating: number,
}

export type { 
  rawMediaInfo,
  cleanMediaInfo,
  ratingObj,
  omdbSearchResult,
  omdbSearch,
  review
}
