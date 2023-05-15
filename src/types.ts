interface stringIndex {
  [key: string]: any,
}

interface ratingObj {
  Source: String,
  Value: String,
}

interface basicMovieInfo extends stringIndex {
  Title: String,
  Year: String,
  Rated: String,
  Released: String,
  Plot: String,
  Language: String,
  Country: String,
  Awards: String,
  Poster: String,
  imdbID: String,
  Type: String,
  DVD: String,
  BoxOffice: String,
  Production: String,
  Website: String,
  Response: String,
}

interface rawMovieInfo extends basicMovieInfo {
  Genre: String,
  Director: String,
  Writer: String,
  Actors: String,
  // Add dirty rating obj here
  Ratings?: ratingObj[],
  Metascore?: String,
  imdbRating?: String,
  imdbVotes?: String,
}

interface cleanMovieInfo extends basicMovieInfo {
  Genre: String[],
  Director: String[],
  Writer: String[],
  Actors: String[],
  // Add extracted rating data here
  IMDBRating: String,
  RottenTomatoesRating: String,
  MetacriticRating: String,
}

interface omdbSearchResult {
  Poster: String,
  Title: String,
  Type: String,
  Year: String,
  imdbID: String,
}

interface omdbSearch {
  Response: String,
  Search: omdbSearchResult[],
  totalResults: String,
}

// Will probably want to add types for people Records and Genre Records, just to make sure we're storing the right datatypes in our DB

export type { rawMovieInfo, cleanMovieInfo, ratingObj, omdbSearchResult, omdbSearch }
