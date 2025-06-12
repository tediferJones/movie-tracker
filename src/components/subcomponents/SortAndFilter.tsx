import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Dispatch,
  InputHTMLAttributes,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  ArrowDownAz,
  ArrowDownZa,
  ChevronUp,
  Dices,
  ListRestart,
  Lock,
  X
} from 'lucide-react';
import FancyInput from '@/components/subcomponents/fancyInput';
import { fromCamelCase } from '@/lib/formatters';

type ReactState<T> = [T, Dispatch<SetStateAction<T | undefined>>]

type Range = {
  min: number,
  max: number,
  step?: number,
  factor?: number,
  format?: (n: number) => InputHTMLAttributes<HTMLInputElement>['value'],
}

type Filters<T> = { [K in keyof T]?: { values: T[K][], names?: string[] } }

type DefaultStates<T> = {
  searchTerm: string,
  searchType: Extract<keyof T, string>,
  sortBy: Extract<keyof T, string>,
  sortType: 'asc' | 'desc',
  filters: { [K in keyof T]?: T[K][] },
  ranges: { [K in keyof T]?: { min: number, max: number } },
}

// FIX ME
// also rename 'searchable', 'sortable' and 'filterable' to 'search', 'sort', and 'filter'
// figure out whats up with Filter by watch again, select a filter then unselect and no results are shown
// - either all should be checked by default (makes the most sense) or when none are checked no filter is applied
// Add ability to set loading text (if provided)

export default function SortAndFilter<T>(
  {
    allData,
    subsetState: [subsetData, setSubsetData],
    searchable,
    sortable,
    filterable,
    rangeable,
    prefix,
    keyPrefix,
    randomizer,
  }: {
    allData: T[],
    subsetState: ReactState<T[]>,
    searchable?: (Extract<keyof T, string>)[],
    sortable?: { [K in keyof T]?: (a: T[K], b: T[K]) => number },
    filterable?: Filters<T>,
    rangeable?: { [K in keyof T]?: Range },
    prefix?: ReactNode,
    keyPrefix: string,
    randomizer?: boolean,
  }
) {
  const defaultStates = useMemo<DefaultStates<T>>(() => ({
    searchTerm: '',
    searchType: searchable?.length ? searchable[0] : '' as DefaultStates<T>['searchType'],
    sortBy: (Object.keys(sortable || {}).length ? Object.keys(sortable!)[0] : '') as DefaultStates<T>['sortBy'],
    sortType: 'desc',
    filters: !filterable ? {} : Object.keys(filterable).reduce((obj, key) => {
      const typedKey = key as keyof T;
      obj[typedKey] = filterable[typedKey]!.values;
      return obj;
    }, {} as { [K in keyof T]: T[K][] }),
    ranges: !rangeable ? {} : Object.keys(rangeable).reduce((state, key) => {
      const typedKey = key as keyof T;
      const { min, max } = rangeable[typedKey]!;
      state[typedKey] = { min, max };
      return state;
    }, {} as { [K in keyof T]?: { min: number, max: number } }),
  }), []);
  const cache = useRef<{ [key: string]: T[] }>({});

  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(defaultStates.searchTerm);
  const [searchType, setSearchType] = useState(defaultStates.searchType);
  const [sortBy, setSortBy] = useState<DefaultStates<T>['sortBy']>(defaultStates.sortBy);
  // const [sortBy, setSortBy] = useState<DefaultStates<T>['sortBy']>();
  const [sortType, setSortType] = useState<DefaultStates<T>['sortType']>(defaultStates.sortType);
  const [filters, setFilters] = useState<DefaultStates<T>['filters']>(defaultStates.filters);
  const [ranges, setRanges] = useState<DefaultStates<T>['ranges']>(defaultStates.ranges);
  const [isRandomized, setIsRandomized] = useState(false);

  useEffect(() => {
    // const cacheStr = JSON.stringify({
    //   searchTerm,
    //   searchType,
    //   sortBy,
    //   sortType,
    //   filters,
    //   ranges,
    // });
    // if (cache.current[cacheStr]) {
    //   console.log('using cache', cacheStr)
    //   setSubsetData(cache.current[cacheStr]);
    //   return;
    // }
    const { cacheStr, cacheVal } = checkCache();
    if (cacheVal) {
      setSubsetData(cacheVal)
    } else {
      const result = sortAndFilter(allData);
      cache.current[cacheStr] = result;
      setSubsetData(result);
    }
  }, [searchTerm, searchType, sortBy, sortType, filters, ranges]);

  function sortAndFilter(arr: T[]) {
    let result = [ ...arr ];
    if (searchTerm && searchType) {
      console.log('filtering by searching term')
      const typedKey = searchType as keyof T;
      const searchTermLowerCase = searchTerm.toLowerCase();

      result = result.filter(item => {
        // if (!item[typedKey]) return;
        // if (typeof item[typedKey] !== 'string') throw Error('must be a string to search');
        // return (item[typedKey] as string).toLowerCase().includes(searchTermLowerCase);

        if (typeof item[typedKey] === 'string') {
          return (item[typedKey] as string).toLowerCase().includes(searchTermLowerCase);
        }
        if (Array.isArray(item[typedKey])) {
          if (!(item[typedKey] as any[]).every(item => typeof item === 'string')) {
            throw Error('item of array is not string');
          }
          return (item[typedKey] as string[]).some(item => {
            console.log('array searching', item.toLowerCase(), searchTermLowerCase)
            return item.toLowerCase().includes(searchTermLowerCase)
          });
        }
      })
    }
    Object.keys(filters).forEach(filter => {
      console.log('filtering by', filter)
      const typedKey = filter as keyof T;
      result = result.filter(item => {
        return filters[typedKey]?.includes(item[typedKey]);
      });
    });
    Object.keys(ranges).forEach(rangeKey => {
      console.log('filtering by range', rangeKey)
      const typedKey = rangeKey as keyof T;
      result = result.filter(item => {
        const value = item[typedKey] as number || 0;
        const { min, max } = ranges[typedKey]!;
        return min <= value && value <= max;
      });
    });
    if (sortable && sortBy) {
      console.log('sorting')
      result.sort((a, b) => sortable[sortBy]!(a[sortBy], b[sortBy]));
    }
    if (sortType === 'desc') result.reverse();
    return result;
  }

  function checkCache() {
    const cacheStr = JSON.stringify({
      searchTerm,
      searchType,
      sortBy,
      sortType,
      filters,
      ranges,
    });
    let cacheVal;
    if (cache.current[cacheStr]) {
      console.log('using cache', cacheStr)
      cacheVal = cache.current[cacheStr];
    }
    return { cacheStr, cacheVal }
  }

  function reset() {
    console.log('resetting')
    setSearchTerm(defaultStates.searchTerm);
    setSearchType(defaultStates.searchType);
    setSortBy(defaultStates.sortBy);
    setSortType(defaultStates.sortType);
    setFilters(defaultStates.filters);
    setRanges(defaultStates.ranges);
    setSubsetData(allData);
  }

  return (
    <div>
      <div className='flex flex-wrap gap-4 items-stretch'>
        {prefix}
        {!searchable ? <div className='flex-1'></div> :
          <FancyInput
            className='flex-1 shrink-0 items-stretch'
            inputState={[searchTerm, setSearchTerm]}
            inputProps={{
              placeholder: `Search by ${fromCamelCase(searchType)}...`,
              className: 'h-[40px]'
            }}
            delay={250}
          />
        }
        {randomizer && 
          <Button variant='outline'
            onClick={() => {
            if (isRandomized) {
              console.log('clear randomizer')
              setIsRandomized(false);
              const { cacheVal } = checkCache();
              setSubsetData(cacheVal || sortAndFilter(allData));
            } else {
              setIsRandomized(true);
              const { cacheVal } = checkCache();
              const options = cacheVal || sortAndFilter(allData);
              const randomIndex = Math.floor(Math.random() * options.length);
              setSubsetData([ options[randomIndex] ]);
            }
          }}>
            <span className='relative px-4 py-2 inline-block'>
              <X className={`absolute inset-0 m-auto duration-300 transition-opacity ${isRandomized ? 'opacity-0' : 'opacity-100'}`} />
              <Dices className={`absolute inset-0 m-auto duration-300 transition-opacity ${isRandomized ? 'opacity-100' : 'opacity-0'}`} />
            </span>
            {/*
            {isRandomized ? <X /> : <Dices />}
            */}
          </Button>
        }
        <div className='flex flex-1 md:flex-grow-0 gap-4'>
          <div className='flex-1 my-auto text-nowrap text-muted-foreground text-center'>
            {subsetData.length} / {allData.length}
          </div>
          <Button className='flex-1'
            variant='outline'
            onClick={() => setShowDropDown(!showDropDown)}
          >
            <ChevronUp className={`transition-all ${showDropDown ? '-rotate-180' : '-rotate-90'}`} />
          </Button>
        </div>
      </div>
      <div className={`showOutline flex flex-wrap gap-4 transition-all duration-300 ${showDropDown ? 'scale-100 max-h-[9999px] mt-4 p-4' : 'scale-0 max-h-[0px] mt-0 p-0'}`}>
        <Button variant='outline' onClick={reset}>
          <ListRestart />
        </Button>
        {searchable &&
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='flex-1'
                variant='outline'
              >Search By</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Search By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={searchType}
                onValueChange={(val) => setSearchType(val as DefaultStates<T>['searchType'])}
              >
                {searchable.map(searchType => (
                  <DropdownMenuRadioItem value={searchType}
                    key={`searchable-${searchType}`}
                  >
                    {fromCamelCase(searchType)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        {filterable && Object.keys(filterable).map(filterType => {
          const typedKey = filterType as keyof T;
          return <DropdownMenu key={`filterable-${filterType}`}>
            <DropdownMenuTrigger asChild>
              <Button className='flex-1'
                variant='outline'
              >{`Filter by ${fromCamelCase(filterType)}`}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                {`Filter by ${fromCamelCase(filterType)}`}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterable[typedKey]!.values.map((val, i) => (
                <DropdownMenuCheckboxItem
                  key={`filterable-${filterType}-${val}`}
                  onSelect={(e) => e.preventDefault()}
                  checked={filters[typedKey]?.includes(val)}
                  onCheckedChange={() => {
                    if (!filters[typedKey]) {
                      setFilters({
                        ...filters,
                        [typedKey]: [val],
                      })
                    } else {
                      setFilters({
                        ...filters,
                        [typedKey]: filters[typedKey]?.includes(val)
                          ? filters[typedKey]?.filter(key => key !== val)
                          : filters[typedKey]?.concat(val)
                      })
                    }
                  }}
                >
                  {filterable[typedKey]!.names?.[i] || fromCamelCase(`${val}`)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        })
        }
        {rangeable && Object.keys(rangeable)
          .map(rangeKey => {
            const typedKey = rangeKey as keyof T
            const { factor = 1, min, max, format, ...inputProps } = rangeable[typedKey]!;
            const minValue = ranges[typedKey]!.min / factor;
            const maxValue = ranges[typedKey]!.max / factor;
            return (
              <label className='flex flex-1 gap-2 items-center'
                key={`rangeable-${rangeKey}`}
              >
                <span>{fromCamelCase(rangeKey)}</span>
                <Input className='w-20 flex-1'
                  {...inputProps}
                  type='number'
                  value={format?.(minValue) || minValue}
                  min={min / factor}
                  max={ranges[typedKey]!.max / factor}
                  onChange={(e) => {
                    setRanges({
                      ...ranges,
                      [typedKey]: {
                        ...ranges[typedKey],
                        min: Number(e.currentTarget.value) * factor,
                      }
                    })
                  }}
                />
                <span>-</span>
                <Input className='w-20 flex-1'
                  {...inputProps}
                  type='number'
                  value={format?.(maxValue) || maxValue}
                  min={ranges[typedKey]!.min / factor}
                  max={max / factor}
                  onChange={(e) => {
                    setRanges({
                      ...ranges,
                      [typedKey]: {
                        ...ranges[typedKey],
                        max: Number(e.currentTarget.value) * factor,
                      }
                    })
                  }}
                />
              </label>
            )
          })
        }
        {sortable && 
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='flex-1'
                  variant='outline'
                >Sort By</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy}
                  onValueChange={(val) => setSortBy(val as DefaultStates<T>['sortBy'])}
                >
                  {Object.keys(sortable).map(sortType => (
                    <DropdownMenuRadioItem value={sortType}
                      key={`sortable-${sortType}`}
                    >
                      {fromCamelCase(sortType)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className={`relative my-auto bg-secondary rounded-full h-8 min-w-16 max-w-16 ${sortBy ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => {
                if (!sortBy) return;
                setSortType(sortType === 'asc' ? 'desc': 'asc');
              }}
            >
              <div className={`absolute flex items-center justify-center bg-primary h-full aspect-square rounded-full transition-all duration-1000 ${!sortBy ? 'left-4 right-4 opacity-50 cursor-none' : sortType === 'asc' ? 'left-0 right-8' : 'left-8 right-0'}`}>
                {/*
                <Lock className={`h-3/4 cursor-default ${!sortBy ? 'w-full' : 'w-0'}`} />
                <ArrowDownAz className={`h-3/4 transition-all duration-1000 ${sortBy && sortType === 'asc' ? 'w-full' : 'w-0'}`} />
                <ArrowDownZa className={`h-3/4 transition-all duration-1000 ${sortBy && sortType === 'desc' ? 'w-full' : 'w-0'}`} />
                */}
                <Lock className={`absolute h-3/4 transition-all duration-300 ${!sortBy ? 'opacity-100' : 'opacity-0'}`} />
                <ArrowDownAz className={`absolute h-3/4 transition-all duration-300 ${sortBy && sortType === 'asc' ? 'opacity-100' : 'opacity-0'}`} />
                <ArrowDownZa className={`absolute h-3/4 transition-all duration-300 ${sortBy && sortType === 'desc' ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
          </>
        }
      </div>
    </div>
  )
}
