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

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import { ChevronUp } from 'lucide-react';
import FancyInput from '@/components/subcomponents/fancyInput';
import { fromCamelCase } from '@/lib/formatters';

type ReactState<T> = [T, Dispatch<SetStateAction<T | undefined>>]
type Other = typeof other[number]
type SortTypes = {
  number: number,
  string: string,
  other: Other,
}
type SortFuncs = {
  [K in keyof SortTypes]: (a: SortTypes[K], b: SortTypes[K]) => number
}

const other = [true, null, false, undefined] as const;
// const otherTypes = other.map(val => `${val}`);
const otherTypes = other.map(val => typeof val);
const sortFuncs: SortFuncs = {
  'number': (a: number, b: number) => (a || -Infinity) - (b || -Infinity),
  'string': (a: string, b: string) => a.localeCompare(b),
  'other': (a: Other, b: Other) => other.indexOf(a) - other.indexOf(b),
}
function getSortType(a: any) {
  const type = typeof(a);
  return otherTypes.includes(type) ? 'other' : type;
}

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
    sortable?: (Extract<keyof T, string>)[],
    filterable?: { [K in keyof T]?: { values: T[K][], names?: string[] } }
    prefix?: ReactNode,
    keyPrefix: string,
  }
) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(searchable?.length ? searchable[0] : '');
  const [sortBy, setSortBy] = useState<Extract<keyof T, string>>();
  const [filters, setFilters] = useState<{ [K in keyof T]?: T[K][] }>({});

  useEffect(() => {
    // console.log({
    //   searchTerm,
    //   searchType,
    //   sortBy,
    //   filters,
    // })
    let result = allData;
    if (searchTerm && searchType) {
      const typedKey = searchType as keyof T;
      const searchTermLowerCase = searchTerm.toLowerCase();
      result = result.filter(item => {
        if (!item[typedKey]) return;
        if (typeof item[typedKey] !== 'string') throw Error('must be a string to search');
        return (item[typedKey] as string).toLowerCase().includes(searchTermLowerCase);
      })
    }
    Object.keys(filters).forEach(filter => {
      const typedKey = filter as keyof T;
      result = result.filter(item => {
        return filters[typedKey]?.includes(item[typedKey]);
      });
    })
    console.log('TEST getSortType', getSortType(null))
    if (sortBy) {
      console.log('sorting', sortBy)
      result.sort((item1, item2) => {
        const a = item1[sortBy];
        const b = item2[sortBy];
        // @ts-ignore
        // return a - b
        const typeA = getSortType(a);
        const typeB = getSortType(b);
        // if (a === null || b === null) {
        //   console.log('null fixer', a, b)
        //   if (a === null) return -Infinity
        //   if (b === null) return Infinity
        //   return 0
        // }
        if (typeA !== typeB) {
          console.log({ a, typeA, b, typeB })
          throw Error('type mismatch when sorting');
        }
        if (!Object.keys(sortFuncs).includes(typeA)) {
          throw Error(`Unsupported sort function: ${typeA}`);
        }
        return (sortFuncs as any)[typeA](a, b);
      });
    }
    console.log(result)
    setSubsetData([...result]);
  }, [searchTerm, searchType, sortBy, filters]);

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
        <Button variant='outline' onClick={() => setShowDropDown(!showDropDown)}>
          <ChevronUp className={`transition-all ${showDropDown ? '-rotate-180' : '-rotate-90'}`} />
        </Button>
      </div>
      <div className={`flex gap-4 transition-all duration-1000 ${showDropDown ? 'scale-100 max-h-96 mt-4' : 'scale-0 max-h-0 mt-0'}`}>
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
        {sortable && 
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
                  if (sortBy === val) setSortBy(undefined)
                  return setSortBy(val as Extract<keyof T, string>)
                }}
              >
                {sortable.map(sortType => (
                  <DropdownMenuRadioItem value={sortType}>
                    {fromCamelCase(sortType)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        {filterable && Object.keys(filterable).map(filterType => {
          const typedKey = filterType as keyof T;
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
              {filterable[typedKey]?.values.map((val, i) => (
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
                  {filterable[typedKey]?.names?.[i] || fromCamelCase(`${val}`)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        })}
      </div>
    </div>
  )
}
