interface StrIdx { [key: string]: any }

interface RatingObj {
  Source: string,
  Value: string,
}

interface StrIdxRawMedia extends StrIdx {
  Title: string,
  imdbID: string,
  Type: string,
  Genre: string,
  Director: string,
  Writer: string,
  Actors: string,
  Ratings: RatingObj[],
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

interface OmdbSearchResult {
  Poster: string,
  Title: string,
  Type: string,
  Year: string,
  imdbID: string,
}

// interface OmdbSearch {
//   Response: string,
//   Search: OmdbSearchResult[],
//   totalResults: string,
// }

interface OmdbSearchSuccess {
  Response: 'True',
  totalResults: string,
  Search: OmdbSearchResult[],
}

interface OmdbSearchFailure {
  Response: 'False',
  Error: string,
}

type OmdbSearch = OmdbSearchSuccess | OmdbSearchFailure

import { countries, genres, languages, media, people, reviews } from '@/drizzle/schema';

interface FormattedMediaInfo extends StrIdx {
  mediaInfo: typeof media.$inferInsert,
  genres?: (typeof genres.$inferInsert)[],
  countries?: (typeof countries.$inferInsert)[],
  languages?: (typeof languages.$inferInsert)[],
  people?: (typeof people.$inferInsert)[],
}

type MediaSelect = typeof media.$inferSelect
interface ExistingMediaInfo extends MediaSelect {
  [key: string]: any,
  genre: string[],
  country: string[],
  language: string[],
  actor: string[],
  director: string[],
  writer: string[]
}

interface ListsRes {
  allListnames?: string[],
  containsImdbId?: string[],
  allMediaInfo?: ExistingMediaInfo[],
  defaultList?: string
}

type ReviewSelect = typeof reviews.$inferSelect
interface ReviewsRes extends ReviewSelect {
  title?: string,
}

interface UserRes {
  listnames: string[],
  watched: { date: number, imdbId: string, title: string, }[],
  reviews: ReviewsRes[],
  defaultList?: string,
}

interface Episode {
  Episode: string,
  Released: string,
  Title: string,
  imdbID: string,
  imdbRating: string,
}

interface SeasonResponse {
  Episodes: Episode[],
  Response: 'True' | 'False';
  Season: string,
  Title: string,
  totalSeasons: string,
}

export type { 
  RatingObj,
  StrIdxRawMedia,
  OmdbSearchResult,
  OmdbSearch,
  FormattedMediaInfo,
  ExistingMediaInfo,
  ListsRes,
  ReviewsRes,
  UserRes,
  Episode,
  SeasonResponse,
}
