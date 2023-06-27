interface stringIndexableObject {
  [key: string]: any,
}

interface ratingObj {
  Source: string,
  Value: string,
}

interface basicMovieInfo extends stringIndexableObject {
  Title: string,
  imdbID: string,
  Type: string,
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
  Rated: string,
  Plot: string,
  Awards: string,
  Poster: string,
  Production: string,
  Website: string,
}

interface cleanMediaInfo extends basicMovieInfo {
  Genre: string[],
  Director: string[],
  Writer: string[],
  Actors: string[],
  // Add extracted rating data here
  IMDBRating: number | null,
  RottenTomatoesRating: number | null,
  MetacriticRating: number | null,
  cachedAt: number,
  Released: number | null,
  DVD: number | null,
  Year: number,
  imdbVotes: number | null,
  Runtime: number | null,
  Country: string[],
  Language: string[],
  BoxOffice: number | null,
  totalSeasons: number | null,
  Season: number | null,
  Episode: number | null,
  Rated: string | null,
  Plot: string | null,
  Awards: string | null,
  Poster: string | null,
  Production: string | null,
  Website: string | null,
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

interface episode {
  Episode: string,
  Released: string,
  Title: string,
  imdbID: string,
  imdbRating: string,
}

interface episodeList {
  Episodes: episode[],
  Response: 'True' | 'False';
  Season: string,
  Title: string,
  totalSeasons: string,
}

interface review extends stringIndexableObject {
  username: string,
  imdbID: string,
  watchAgain: boolean | null,
  myRating: number,
}

interface watched {
  date: number,
  id: string,
  imdbID: string,
  username: string,
}

interface userLists {
  [key: string]: string[]
}

export type { 
  rawMediaInfo,
  cleanMediaInfo,
  ratingObj,
  omdbSearchResult,
  omdbSearch,
  episode,
  episodeList,
  review,
  watched,
  userLists,
}
