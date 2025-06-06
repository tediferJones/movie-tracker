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
  ReactNode,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import { ArrowDownAz, ArrowUpZa, ChevronUp, Lock } from 'lucide-react';
import FancyInput from '@/components/subcomponents/fancyInput';
import { fromCamelCase } from '@/lib/formatters';

type ReactState<T> = [T, Dispatch<SetStateAction<T | undefined>>]

// consider getting rid of all this, just make two seperate types/props
// filters for 'select'
// range for 'number'
// they require seperate state variables so might as well split the props too
// also rename 'searchable', 'sortable' and 'fitlerable' to 'search', 'sort', and 'filter'
// figure out whats up with Filter by watch again, select a filter then unselect and no results are shown
// - either all should be checked by default (makes the most sense) or when none are checked no filter is applied
type FilterType = 'select' | 'number'
type FilterOpts<K, T extends FilterType = FilterType> = {
  select: {
    values: K[],
    names?: string[],
  },
  number: {
    min: number,
    max: number,
    step: number,
    // formatFunc?: (n: number) => number,
    factor?: number, 
  }
}[T]
type Filterable<K, T extends FilterType> = {
  type: T
} & FilterOpts<K, T>
type RangeState<T> = { [K in keyof T]?: { min: number, max: number } }

export default function SortAndFilter<T>(
  {
    allDataState: [allData, setAllData],
    subsetState: [subsetData, setSubsetData],
    searchable,
    sortable,
    filterable,
    prefix,
    keyPrefix,
  }: {
    allDataState: ReactState<T[]>,
    subsetState: ReactState<T[]>,
    searchable?: (Extract<keyof T, string>)[],
    // sortable?: (Extract<keyof T, string>)[],
    sortable?: { [K in keyof T]?: (a: T[K], b: T[K]) => number },
    // filterable?: { [K in keyof T]?: { values: T[K][], names?: string[] } }
    filterable?: { [K in keyof T]?: Filterable<T[K], FilterType> }
    prefix?: ReactNode,
    keyPrefix: string,
  }
) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(searchable?.length ? searchable[0] : '');
  const [sortBy, setSortBy] = useState<Extract<keyof T, string>>();
  const [sortType, setSortType] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<{ [K in keyof T]?: T[K][] }>({});
  const [range, setRange] = useState<RangeState<T>>(
    !filterable ? {} : Object.keys(filterable)
      .filter(key => filterable[key as keyof T]?.type === 'number')
      .reduce((obj, key) => {
        const typedKey = key as keyof T;
        const { min, max } = filterable[typedKey] as Filterable<T[keyof T], 'number'>
        obj[typedKey] = { min, max }
        return obj
      }, {} as RangeState<T>)
  );

  useEffect(() => {
    let result = [ ...allData ];
    console.log(range)
    if (searchTerm && searchType) {
      console.log('use search term')
      const typedKey = searchType as keyof T;
      const searchTermLowerCase = searchTerm.toLowerCase();
      result = result.filter(item => {
        if (!item[typedKey]) return;
        if (typeof item[typedKey] !== 'string') throw Error('must be a string to search');
        return (item[typedKey] as string).toLowerCase().includes(searchTermLowerCase);
      })
    }
    Object.keys(filters).forEach(filter => {
      console.log('filtering', filter)
      const typedKey = filter as keyof T;
      result = result.filter(item => {
        return filters[typedKey]?.includes(item[typedKey]);
      });
    });
    Object.keys(range).forEach(rangeKey => {
      console.log('filtering', rangeKey)
      const typedKey = rangeKey as keyof T;
      result = result.filter(item => {
        const value = item[typedKey] as number || 0;
        return range[typedKey]!.min <= value && value <= range[typedKey]!.max;
      });
    });
    if (sortable && sortBy) {
      console.log('sorting')
      result.sort((a, b) => sortable[sortBy]!(a[sortBy], b[sortBy]));
    }
    console.log('setting state')
    if (sortType === 'desc') result.reverse();
    setSubsetData(result);
  }, [searchTerm, searchType, sortBy, sortType, filters, range]);

  return (
    <div>
      <div className='flex gap-4 items-stretch'>
        {prefix}
        {!searchable ? <div className='flex-1'></div> :
          <FancyInput
            className='flex-1 shrink-0 items-stretch'
            inputState={[searchTerm, setSearchTerm]}
            inputProps={{
              placeholder: `Search by ${fromCamelCase(searchType)}...`
            }}
          />
        }
        <div className='my-auto text-nowrap text-muted-foreground'>
          {subsetData.length} / {allData.length}
        </div>
        <Button variant='outline' onClick={() => setShowDropDown(!showDropDown)}>
          <ChevronUp className={`transition-all ${showDropDown ? '-rotate-180' : '-rotate-90'}`} />
        </Button>
      </div>
      <div className={`flex flex-wrap gap-4 transition-all duration-1000 ${showDropDown ? 'scale-100 max-h-96 mt-4' : 'scale-0 max-h-0 mt-0'}`}>
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
                onValueChange={setSearchType}
              >
                {searchable.map(searchType => (
                  <DropdownMenuRadioItem value={searchType}>
                    {fromCamelCase(searchType)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        {filterable && Object.keys(filterable)
          .filter(key => filterable[key as keyof T]!.type === 'select')
          .map(filterType => {
            const typedKey = filterType as keyof T;
            const filter = filterable[typedKey] as Filterable<T[keyof T], 'select'>
            return <DropdownMenu>
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
                {filter.values.map((val, i) => (
                  <DropdownMenuCheckboxItem
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
                    {filter.names?.[i] || fromCamelCase(`${val}`)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          })
        }
        {filterable && Object.keys(filterable)
          .filter(key => filterable[key as keyof T]!.type === 'number')
          .map(filterType => {
            const typedKey = filterType as keyof T
            const filter = filterable[typedKey] as Filterable<T[keyof T], 'number'>
            const { factor = 1, min, max, ...inputProps } = filter;
            return (
              <label className='flex gap-2 items-center'>
                <span>{fromCamelCase(filterType)}</span>
                <Input className='w-20'
                  {...inputProps}
                  value={range[typedKey]!.min / factor}
                  min={min / factor}
                  max={range[typedKey]!.max / factor}
                  onChange={(e) => {
                    setRange({
                      ...range,
                      [typedKey]: {
                        ...range[typedKey],
                        min: Number(e.currentTarget.value) * factor,
                      }
                    })
                  }}
                  // defaultValue={formatFunc?.(inputProps.min)}
                  // {...inputProps}
                />
                <span>-</span>
                <Input className='w-20'
                  {...inputProps}
                  value={range[typedKey]!.max / factor}
                  min={range[typedKey]!.min / factor}
                  max={max / factor}
                  onChange={(e) => {
                    setRange({
                      ...range,
                      [typedKey]: {
                        ...range[typedKey],
                        max: Number(e.currentTarget.value) * factor,
                      }
                    })
                  }}
                  // defaultValue={formatFunc?.(inputProps.max)}
                  // {...inputProps}
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
                  onValueChange={(val) => {
                    console.log(sortBy, val)
                    if (sortBy === val) return setSortBy(undefined)
                    return setSortBy(val as Extract<keyof T, string>)
                  }}
                >
                  {Object.keys(sortable).map(sortType => (
                    <DropdownMenuRadioItem value={sortType}>
                      {fromCamelCase(sortType)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className={`relative my-auto bg-secondary rounded-full h-8 min-w-16 max-w-16 transition-all duration-1000 ${sortBy ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => {
                if (!sortBy) return;
                setSortType(sortType === 'asc' ? 'desc': 'asc');
              }}
            >
              <div className={`absolute flex items-center justify-center bg-primary h-full aspect-square rounded-full transition-all duration-1000 ${!sortBy ? 'left-4 right-4 opacity-50 cursor-none' : sortType === 'asc' ? 'left-0 right-8' : 'left-8 right-0'}`}>
                <Lock className={`h-3/4 cursor-default ${!sortBy ? 'w-full' : 'w-0'}`} />
                <ArrowDownAz className={`h-3/4 transition-all duration-1000 ${sortBy && sortType === 'asc' ? 'w-full' : 'w-0'}`} />
                <ArrowUpZa className={`h-3/4 transition-all duration-1000 ${sortBy && sortType === 'desc' ? 'w-full' : 'w-0'}`} />
              </div>
            </div>
          </>
        }
      </div>
    </div>
  )
}
