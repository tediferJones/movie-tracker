'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FancyInput from '@/components/subcomponents/fancyInput';
import SearchResults from '@/components/subcomponents/searchResults';
import Loading from '@/components/subcomponents/loading';
import easyFetch from '@/lib/easyFetch';
import { OmdbSearch } from '@/types';

export default function Searchbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [displaySearchResult, setDisplaySearchResult] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<OmdbSearch>();
  const router = useRouter();

  useEffect(() => {
    if (!searchTerm) return setSearchResult(undefined);
    setIsSearching(true);
    easyFetch<OmdbSearch>('/api/search', 'GET', { 
      // use .trim(), because if you add a space after searchTerm, omdbAPI returns nothing
      searchTerm: searchTerm.trim(), 
      searchType, 
      queryTerm: 's', 
      queryType: 'type',
    }).then(data => {
        setSearchResult(data);
        setIsSearching(false);
      });
  }, [searchTerm, searchType]);

  function getSearchUrl() {
    const params = new URLSearchParams({
      searchTerm: searchTerm.trim(), 
      searchType, 
      queryTerm: 's', 
      queryType: 'type',
    });

    return `/search?${params.toString()}`;
  }

  return (
    <form className='m-auto flex flex-wrap w-4/5 justify-center py-4 gap-4 z-30'
      onSubmit={(e) => {
        e.preventDefault();
        router.push(getSearchUrl());
        setDisplaySearchResult(false);
      }}
    >
      {/* Pop-up backdrop */}
      <div className={`-z-10 fixed left-0 top-0 h-[100vh] w-[100vw] transition-all duration-300 ${displaySearchResult ? 'opacity-100 backdrop-blur-md' : 'opacity-0 backdrop-blur-none pointer-events-none'}`}
        onClick={() => setDisplaySearchResult(false)}>
      </div> 
      {/* Selector for media type */}
      <Select
        defaultValue={searchType}
        onValueChange={val => {
          setSearchResult(undefined);
          setSearchType(val);
        }}
      >
        <SelectTrigger className='flex-1 order-1'>
          <SelectValue className='flex justify-between text-center' />
        </SelectTrigger>
        <SelectContent>
          {['Movie', 'Series', 'Game'].map(searchTerm => (
            <SelectItem
              key={searchTerm}
              value={searchTerm.toLowerCase()}
            >{searchTerm}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Search bar area */}
      <div className='relative flex flex-col flex-[6] sm:order-2 order-3'>
        <FancyInput 
          className='sm:h-full h-[40px] min-w-72'
          inputState={[searchTerm, setSearchTerm]}
          delay={250}
          inputProps={{
            placeholder: 'Search...',
            onFocus: () => setDisplaySearchResult(true),
            onBlur: (e) => e.stopPropagation(),
            className: 'text-lg',
          }}
          autoFillParam={'searchTerm'}
        />
        {/* Search Results area */}
        <div className={`opacity-95 absolute top-12 flex w-full flex-col gap-2 p-2 bg-secondary items-center z-10 transition-all duration-300 showOutline overflow-hidden ${displaySearchResult && searchTerm ? 'scale-y-100' : 'scale-y-0'}`}>
          {isSearching || !searchResult ? <Loading /> :
            searchResult.Response === 'False' ? <div className='p-2'>{searchResult.Error}</div> :
              <>
                <SearchResults results={searchResult.Search}
                  onLinkClick={(e) => e.ctrlKey || setDisplaySearchResult(false)}
                />
                {Number(searchResult.totalResults) - searchResult.Search.length > 0 &&
                  <button className='text-primary bg-primary-foreground w-full p-2 rounded-lg hover:underline ring-offset-2 ring-offset-background hover:ring-ring hover:ring-2'
                    type='submit'
                  >
                    View {Number(searchResult.totalResults) - searchResult.Search.length} Other Results
                  </button>
                }
              </>
          }
        </div>
      </div>
      <Button className='flex-1 z-10 sm:order-3 order-2'
        variant='outline'
        type='submit'
      >Search</Button>
    </form>
  )
}
