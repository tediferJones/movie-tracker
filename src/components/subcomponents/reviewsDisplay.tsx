'use client';

// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// import { ChevronUp } from 'lucide-react';
import { reviews } from '@/drizzle/schema';
import Loading from '@/components/subcomponents/loading';
import AutoPaging from '@/components/subcomponents/AutoPaging';
// import FancyInput from '@/components/subcomponents/fancyInput';
import easyFetch from '@/lib/easyFetch';
import { formatTimestamp/*, fromCamelCase*/ } from '@/lib/formatters';
import SortAndFilter from '@/components/subcomponents/SortAndFilter';
// import { inputValidation } from '@/lib/inputValidation';

type ExistingReview = typeof reviews.$inferSelect & { title?: string }

// type SearchParams = {
//   minRating: number,
//   maxRating: number,
//   searchType: keyof Omit<Omit<Omit<Omit<ExistingReview, 'imdbId'>, 'rating'>, 'date'>, 'watchAgain'>
//   // searchType: StringKeys<ExistingReview>,
// }

// type StringKeys<T> = {
//   [K in keyof T]: T[K] extends string ? K : never;
// }[keyof T]

// class TwoWayMap<K, V> {
//   keyToVal: Map<K, V>;
//   valToKey: Map<V, K>;
// 
//   constructor(map: Map<K, V>) {
//     this.keyToVal = map;
//     this.valToKey = new Map(
//       [ ...map.keys() ].map(key => [ map.get(key)!, key ])
//     );
//   }
// }

export default function ReviewsDisplay(
  {
    username,
    imdbId,
    extTrigger,
  }: {
    username?: string,
    imdbId?: string,
    extTrigger?: boolean,
  }
) {
  // FIX ME
  // Add searchbar (similar to table)
  //  - sort by Date, review value, watchAgain value, title/username depending on presence of username/imdbId 
  //  - search by review min/max, watchAgain value, title/username depending on presence of username/imdbId
  //  - consider using checkboxes for filtering, that way users can do something like:
  //    - show reviews with review content, watchAgain true or null, and rating greater than 2 but less than 4
  const [reviews, setReviews] = useState<ExistingReview[]>();
  const [allReviews, setAllReviews] = useState<ExistingReview[]>();

  const [page, setPage] = useState(1);
  const pageSize = 5;

  // const [searchTerm, setSearchTerm] = useState('');
  // const [showDropDown, setShowDropDown] = useState(false);

  useEffect(() => {
    // if imdbId exists, only fetch records related to imdbId
    // if no imdbId, fetch all records for user
    if (username) {
      easyFetch<ExistingReview[]>({
        route: `/api/users/${username}/reviews`,
        method: 'GET',
      }).then(data => {
          setReviews(data);
          setAllReviews(data);
        });
    } else if (imdbId) {
      easyFetch<ExistingReview[]>({
        route: `/api/media/${imdbId}/reviews`,
        method: 'GET',
      }).then(data => {
          setReviews(data);
          setAllReviews(data);
        });
    } else {
      throw Error('reviewsDisplay requires an imdbId or a username');
    }
  }, [extTrigger, username]);

  const displayType = username ? 'title' : 'username';
  // const searchable = [displayType, 'review'] as const;
  // type Searchable = typeof searchable[number];
  // const sortable = ['date', 'rating', 'watchAgain', displayType] as const;
  // type Sortable = typeof sortable[number];
  // const [searchType, setSearchType] = useState<Searchable>('review');
  // const [sortBy, setSortBy] = useState<Sortable>();
  // const [minRating, setMinRating] = useState(0);
  // const [maxRating, setMaxRating] = useState(100);
  // const [watchAgainFilter, setWatchAgainFilter] = useState<ExistingReview['watchAgain'][]>([]);
  // const watchAgainConverter = new TwoWayMap<ExistingReview['watchAgain'], string>(
  //   new Map([
  //     [true, 'Would watch again'],
  //     [null, 'No Opinion'],
  //     [false, 'Would NOT watch again'],
  //   ])
  // );
  // useEffect(() => {
  //   if (!reviews || !allReviews) return;
  //   console.log({
  //     searchTerm,
  //     searchType,
  //     sortBy,
  //     minRating,
  //     maxRating,
  //     watchAgainFilter,
  //   })
  //   let result = allReviews.filter(review => {
  //     const rating = Number(review.rating);
  //     return minRating <= rating && rating <= maxRating;
  //   });
  //   if (searchTerm && searchType) {
  //     result = result.filter(review => 
  //       review[searchType]?.toLowerCase()?.includes(searchTerm.toLowerCase())
  //     );
  //   }
  //   if (watchAgainFilter.length) {
  //     result = result.filter(review => watchAgainFilter.includes(review.watchAgain));
  //   }
  //   if (sortBy) {
  //     result = result.sort((a, b) => {
  //       return `${a[sortBy]}`.toLowerCase().localeCompare(`${b[sortBy]}`.toLowerCase())
  //     })
  //   }
  //   setReviews(result);
  // }, [searchTerm, searchType, sortBy, minRating, maxRating, watchAgainFilter]);

  return (
    <div className='showOutline flex flex-col gap-2 p-4 max-h-[480px]'>
      {!reviews || !allReviews ? <div>borked</div> :
        <SortAndFilter<ExistingReview> 
          allDataState={[allReviews, setAllReviews]}
          subsetState={[reviews, setReviews]}
          searchable={['review', displayType]}
          sortable={['date', 'rating', 'watchAgain', displayType]}
          filterable={{
            'watchAgain': {
              values: [true, null, false],
              names: ['Would watch again', 'No Opinion', 'Would NOT watch again']
            }
          }}
          prefix={
            <h3 className='text-xl my-auto'>
              Reviews {reviews?.length ? `(${reviews.length})` : ''}
            </h3>
          }
          keyPrefix='reviews'
        />
      }
      {/*
      <div className='flex justify-center items-stretch gap-4 min-h-[40px]'>
        <h3 className='text-xl my-auto'>Reviews {reviews?.length ? `(${reviews.length})` : ''}</h3>
        <FancyInput inputState={[searchTerm, setSearchTerm]}
          className='flex-shrink-0 flex-1 items-stretch'
          inputProps={{
            placeholder: `Search by ${searchType}...`
          }}
        />
        <Button variant='outline' onClick={() => setShowDropDown(!showDropDown)}>
          <ChevronUp className={`transition-all ${showDropDown ? '-rotate-180' : '-rotate-90'}`} />
        </Button>
      </div>
      <div className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 ${showDropDown ? 'scale-100 max-h-40' : 'scale-0 max-h-0'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='flex-1'>Search by</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Search by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={searchType} onValueChange={(val) => setSearchType(val as Searchable)}>
              {searchable.map(searchType => (
                <DropdownMenuRadioItem key={`reviewSearch-${searchType}`} value={searchType}>
                  {fromCamelCase(searchType)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='flex-1'>Sort by</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sory by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy}
              onValueChange={(val) => setSortBy(sortBy === val ? undefined : val as Sortable)}
            >
              {sortable.map(sortTerm => (
                <DropdownMenuRadioItem key={`reviewSort-${sortTerm}`} value={sortTerm}>
                  {fromCamelCase(sortTerm)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <label className='flex-1 flex gap-4 items-center'>
          <span className='flex-1 text-nowrap text-center'>Rating Range</span>
          <div className='flex-1 flex gap-4'>
            <Input className='w-20'
              value={(minRating / 20).toFixed(2)}
              onChange={(e) => setMinRating(Number(e.currentTarget.value) * 20)}
              type='number'
              placeholder='Min'
              min={0}
              max={5}
              step={0.05}
            />
            <span className=''>-</span>
            <Input className='w-20'
              value={(maxRating / 20).toFixed(2)}
              onChange={(e) => setMaxRating(Number(e.currentTarget.value) * 20)}
              type='number'
              placeholder='Max'
              min={0}
              max={5}
              step={0.05}
            />
          </div>
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='flex-1'>Watch Again Filter</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Watch Again Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[ ...watchAgainConverter.keyToVal.values() ].map(watchAgainType => (
              <DropdownMenuCheckboxItem key={`reviewsWatchAgain-${watchAgainType}`}
                checked={watchAgainFilter.includes(watchAgainConverter.valToKey.get(watchAgainType)!)}
                onCheckedChange={(e) => {
                  const key = watchAgainConverter.valToKey.get(watchAgainType);
                  if (key === undefined) throw Error('cannot find key');
                  if (e) {
                    setWatchAgainFilter(watchAgainFilter.concat(key));
                  } else {
                    setWatchAgainFilter(watchAgainFilter.filter(filter => filter !== key));
                  }
                }}
              >
                {watchAgainType}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      */}
      {/*
      <hr className='my-2' />
      */}
      <div className='overflow-y-scroll pr-2'>
        {!reviews ? <Loading /> :
          reviews.length === 0 ? <div className='p-4 text-center text-muted-foreground'>No Reviews Found</div> : 
            reviews.slice(0, page * pageSize).map((review, i) => {
              return (
                <>
                  <hr className='my-2' />
                  <Link className='text-foreground group flex flex-col gap-4 p-4 hover:bg-secondary rounded-lg'
                    key={`review-${i}`}
                    href={imdbId ? `/users/${review.username}` : `/media/${review.imdbId}`}
                  >
                    <div className='flex gap-4 flex-wrap'>
                      <span className='text-primary group-hover:underline flex-1 text-center'>
                        {imdbId ? review.username : review.title}
                      </span>
                      <div className='flex-1 text-center'>
                        {review.watchAgain === null ? <span className='text-muted-foreground'>No Opinion</span>
                          : <span>{`Would ${review.watchAgain ? '' : 'NOT'} watch again`}</span>
                        }
                      </div>
                      <div className='flex-1 text-center'>
                        {review.rating ? <span>{`${review.rating / 20} / 5`}</span>
                          : <span className='text-muted-foreground'>No Rating</span>
                        }
                      </div>
                    </div>
                    <div className='text-center'>
                      {review.review ? <span className='break-words'>{review.review}</span>
                        : <span className='text-muted-foreground'>No Review Content</span>
                      }
                    </div>
                    <div className='ml-auto text-muted-foreground'>
                      {formatTimestamp(
                        review.date,
                        { year: 'numeric', month: 'long', day: 'numeric', }
                      )}
                    </div>
                  </Link>
                  {/*
                  {i < reviews.length - 1 && <hr className='my-2' />}
                  */}
                </>
              )
            })
        }
        <AutoPaging 
          setPage={setPage}
          currentCount={page * pageSize}
          maxCount={reviews?.length || 0}
        />
      </div>
    </div>
  )
}
