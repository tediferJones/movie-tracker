import {
  countries,
  genres,
  languages,
  listnames,
  media,
  people,
  reviews,
  watched
} from '@/drizzle/schema';

interface RatingObj {
  Source: string,
  Value: string,
}

interface StrIdxRawMedia {
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

interface FormattedMediaInfo {
  mediaInfo: typeof media.$inferInsert,
  genres?: (typeof genres.$inferInsert)[],
  countries?: (typeof countries.$inferInsert)[],
  languages?: (typeof languages.$inferInsert)[],
  people?: (typeof people.$inferInsert)[],
}

type MediaSelect = typeof media.$inferSelect
interface ExistingMediaInfo extends MediaSelect {
  genre: string[],
  country: string[],
  language: string[],
  actor: string[],
  director: string[],
  writer: string[]
}

type MediaKeys = (keyof ExistingMediaInfo)[]
type MediaStringArrKeys = GetKeysByType<ExistingMediaInfo, string[]>[]

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

type Review = typeof reviews.$inferSelect
type Listname = typeof listnames.$inferSelect
type ListItem = ExistingMediaInfo & { dateAdded: number }
type Watched = typeof watched.$inferSelect
type WatchedWithTitle = typeof watched.$inferSelect & { title: string }
type ReviewWithTitle = Review & { title: string }

type ReviewBody = {
  review: string | null,
  rating: number | null,
  watchAgain: boolean | null,
}

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH'

type FillWith<T extends Partial<Record<Methods, any>>, F> = {
  [K in Methods]: K extends keyof T ? T[K] : F
}

type MakeFieldOptional<T, K extends keyof T> = 
  Omit<T, K> & Partial<Pick<T, K>>

type GetKeysByType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]

export type { 
  RatingObj,
  StrIdxRawMedia,
  OmdbSearchResult,
  OmdbSearch,
  FormattedMediaInfo,
  ExistingMediaInfo,
  MediaKeys,
  MediaStringArrKeys,
  ListsRes,
  ReviewsRes,
  UserRes,
  Episode,
  SeasonResponse,
  Review,
  Listname,
  ListItem,
  Watched,
  WatchedWithTitle,
  ReviewWithTitle,
  Methods,
  FillWith,
  ReviewBody,
  MakeFieldOptional,
  GetKeysByType,
}
