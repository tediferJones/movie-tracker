interface ratingObj {
  Source: string,
  Value: string,
}

interface strIdxRawMedia {
  [key: string]: any,
  Title: string,
  imdbID: string,
  Type: string,
  Genre: string,
  Director: string,
  Writer: string,
  Actors: string,
  Ratings: ratingObj[],
  Metascore: string,
  imdbRating: string,
  Released: string,
  DVD: string,
  Year: string,
  imdbVotes: string,
  Runtime: string,
  Country: string,
  Language: string,
  BoxOffice: string,
  Response: string,
  totalSeasons: string,
  Season: string,
  Episode: string,
  Rated: string,
  Plot: string,
  Awards: string,
  Poster: string,
  Production: string,
  Website: string,
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

interface userLists {
  defaultListname: string | null,
  lists: {
    [key: string]: string[]
  }
}

interface newDefaultList {
  defaultListname: string | null,
  listnames: string[],
  newDefaultListname: string,
}

// interface strIdxMedia extends media {
//   // [key: string]: string[] | string | number | null,
//   [key: string]: any,
// }

import { media } from '@/drizzle/schema';
type MediaTable = typeof media.$inferSelect

interface FormattedMediaInfo {
  mediaInfo: MediaTable,
  genres: any,
  countries: any,
  languages: any,
  people: any,
}

export type { 
  ratingObj,
  strIdxRawMedia,
  // strIdxMedia,
  omdbSearchResult,
  omdbSearch,
  episode,
  episodeList,
  userLists,
  newDefaultList,
  FormattedMediaInfo,
  MediaTable,
}
