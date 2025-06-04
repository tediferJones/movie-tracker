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

export default function SortAndFilter<T>(
  {
    allDataState,
    sortedAndFilteredState,
    searchable,
    sortable,
    filterable,
    prefix,
    keyPrefix,
  }: {
    allDataState: ReactState<T[]>,
    sortedAndFilteredState: ReactState<T[]>,
    searchable?: (Extract<keyof T, string>)[],
    sortable?: (Extract<keyof T, string>)[],
    // filterable?: (Extract<keyof T, string>)[],
    filterable?: { [K in keyof T]?: T[K][] }
    prefix?: ReactNode,
    keyPrefix: string,
  }
) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filters, setFilters] = useState<{ [K in keyof T]?: T[K][] }>({});

  useEffect(() => {
    console.log({
      searchTerm,
      searchType,
      sortBy,
      filters,
    })
  }, [searchTerm, searchType, sortBy, filters]);

  return (
    <div>
      <div className='flex gap-4 items-stretch'>
        {prefix}
        <FancyInput
          className='flex-1 shrink-0 items-stretch'
          inputState={[searchTerm, setSearchTerm]}
          inputProps={{
            placeholder: `Search by ${fromCamelCase(searchTerm)}...`
          }}
        />
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
                onValueChange={setSortBy}
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
              {filterable[typedKey]?.map(option => (
                <DropdownMenuCheckboxItem
                  checked={filters[typedKey]?.includes(option)}
                  onCheckedChange={(e) => {
                    console.log('checked change', e, filters[typedKey])
                    console.log(filters)
                    if (e && !filters[typedKey]) {
                      console.log('no key')
                      setFilters(prev => {
                        prev[typedKey] = [option];
                        return prev;
                      })
                    }
                    setFilters(prev => {
                      prev[typedKey] = prev[typedKey]?.includes(option)
                        ? prev[typedKey]?.filter(key => key !== option)
                        : prev[typedKey]?.concat(option);
                      return prev;
                    })
                  }}
                >
                  {fromCamelCase(`${option}`)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        })}
      </div>
    </div>
  )
}
