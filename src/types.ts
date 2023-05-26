interface stringIndexableObject {
  [key: string]: any,
}

interface ratingObj {
  Source: string,
  Value: string,
}

interface basicMovieInfo extends stringIndexableObject {
  Title: string,
  Year: string,
  Rated: string,
  Released: string,
  Runtime: string,
  Plot: string,
  Language: string,
  Country: string,
  Awards: string,
  Poster: string,
  imdbID: string,
  Type: string,
  DVD: string,
  BoxOffice: string,
  Production: string,
  Website: string,
  Response?: string,
}

interface rawMovieInfo extends basicMovieInfo {
  Genre: string,
  Director: string,
  Writer: string,
  Actors: string,
  // Add dirty rating obj here
  Ratings?: ratingObj[],
  Metascore?: string,
  imdbRating?: string,
  imdbVotes?: string,
}

interface cleanMovieInfo extends basicMovieInfo {
  Genre: string[],
  Director: string[],
  Writer: string[],
  Actors: string[],
  // Add extracted rating data here
  imdbVotes: string,
  IMDBRating: string,
  RottenTomatoesRating: string,
  MetacriticRating: string,
  cachedAt: string,
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

// Will probably want to add types for people Records and Genre Records, just to make sure we're storing the right datatypes in our DB

export type { rawMovieInfo, cleanMovieInfo, ratingObj, omdbSearchResult, omdbSearch }
