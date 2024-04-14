'use client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { useState, useEffect } from 'react';
import { omdbSearch, omdbSearchResult } from '@/types';
import Link from 'next/link';
import easyFetch from '@/lib/easyFetch';

export default function Searchbar() {
  // Try to get rid of this, we only need to keep track of search
  const defaultState: omdbSearch = {
    Search: [],
    Response: 'False',
    totalResults: '0',
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [searchResult, setSearchResult] = useState(defaultState);
  const [displaySearchResult, setDisplaySearchResult] = useState<true | false>(false)

  useEffect(() => {
    console.log(searchTerm);
    if (!searchTerm) return setSearchResult(defaultState);

    let delaySetState: NodeJS.Timeout | undefined = setTimeout(() => {
      easyFetch<omdbSearch>('/api/search', 'GET', { 
        // use .trim(), because if you add a space after searchTerm, omdbAPI returns nothing
        searchTerm: searchTerm.trim(), 
        searchType, 
        queryTerm: 's', 
        queryType: 'type',
      }).then(data => 
          setSearchResult(data.Response === 'True' ? data : defaultState)
        )
    }, 1000);

    return () => clearTimeout(delaySetState);
  }, [searchTerm, searchType])

  let test: NodeJS.Timeout;
  return (
    <div className='m-auto flex w-4/5 justify-center py-4 gap-2'>
      <div className='relative flex w-full flex-col'
        onBlur={() => test = setTimeout(() => setDisplaySearchResult(false), 100)}
        onFocus={() => clearTimeout(test)}
      >
        {!displaySearchResult ? [] : 
          <div className='fixed left-0 top-0 h-[100vh] w-[100vw]' 
            onClick={() => setDisplaySearchResult(false)}>
          </div> 
        }
        <Input className='w-full relative text-xl'
          onFocus={() => setDisplaySearchResult(true)}
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Search...'
        />
        {/* Search Results area */}
        <div className={`absolute top-12 flex w-full flex-col items-center z-10 ${displaySearchResult && searchTerm ? 'showOutline overflow-hidden' : ''}`}>
          {!displaySearchResult ? [] : searchResult.Search.map((item: omdbSearchResult, i) => {
            return (
              <Link className={`flex w-full flex-wrap bg-secondary p-2 rounded-none ${i > 0 ? 'border-t border-primary' : ''}`}
                href={`/media/${item.imdbID}`}
                key={item.imdbID}
                onClick={(e) => e.ctrlKey ? undefined : setDisplaySearchResult(false)}
              > <p className='m-auto flex-[2]'>{item.Title}</p>
                <p className='m-auto flex-1'>{item.Year}</p>
              </Link>
            )
          })}
        </div>
      </div>
      {/* Selector for media type */}
      <Select
        defaultValue={searchType}
        onValueChange={(val) => {
          setSearchResult(defaultState)
          setSearchType(val)
        }}
      >
        <SelectTrigger className='w-min'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['Movie', 'Series', 'Game'].map((searchTerm) => {
            return <SelectItem
              key={searchTerm}
              value={searchTerm.toLowerCase()}
            >{searchTerm}</SelectItem>
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
