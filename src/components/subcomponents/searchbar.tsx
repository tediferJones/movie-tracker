'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FancyInput from '@/components/subcomponents/fancyInput';
import easyFetch from '@/lib/easyFetch';
import { OmdbSearch, OmdbSearchResult } from '@/types';

export default function Searchbar() {
  const defaultState: OmdbSearchResult[] = [];
  let autoCloseTimer: NodeJS.Timeout;

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [searchResult, setSearchResult] = useState(defaultState);
  const [displaySearchResult, setDisplaySearchResult] = useState<boolean>(false);

  useEffect(() => {
    if (!searchTerm) return setSearchResult(defaultState);

    let delaySetState: NodeJS.Timeout | undefined = setTimeout(() => {
      easyFetch<OmdbSearch>('/api/search', 'GET', { 
        // use .trim(), because if you add a space after searchTerm, omdbAPI returns nothing
        searchTerm: searchTerm.trim(), 
        searchType, 
        queryTerm: 's', 
        queryType: 'type',
      }).then(data => 
          setSearchResult(data.Response === 'True' ? data.Search : defaultState)
        )
    }, 250);

    return () => clearTimeout(delaySetState);
  }, [searchTerm, searchType])

  return (
    <div className='m-auto flex w-4/5 justify-center py-4 gap-4'>
      {/* Search bar area */}
      <div className='relative flex flex-col w-full'
        // WHAT DOES THIS DO, WHY IS IT HERE
        // onBlur={() => autoCloseTimer = setTimeout(() => setDisplaySearchResult(false), 1000)}
        // onFocus={() => clearTimeout(autoCloseTimer)}
      >
        {!displaySearchResult ? [] : 
          <div className='fixed left-0 top-0 h-[100vh] w-[100vw]' 
            onClick={() => setDisplaySearchResult(false)}>
          </div> 
        }
        <div className='h-full'
          onFocus={() => setDisplaySearchResult(true)}
        >
          <FancyInput 
            className='w-full relative h-full'
            inputState={[searchTerm, setSearchTerm]}
            delay={250}
            placeholder={'Search...'}
          />
        </div>
        {/*
        <Input className='w-full relative text-xl'
          onFocus={() => setDisplaySearchResult(true)}
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Search...'
        />
        */}
        {/* Search Results area */}
        <div className={`opacity-95 absolute top-12 flex w-full flex-col gap-2 p-2 bg-secondary items-center z-10 ${displaySearchResult && searchTerm ? 'showOutline overflow-hidden block' : 'hidden'}`}>
          {searchResult.length === 0 ? <div className='bg-secondary w-full p-2 text-center'>No Results</div> :
            searchResult.map((item) => (
              <Link className='showOutline flex w-full flex-wrap bg-primary-foreground p-2 hover:underline'
                href={`/media/${item.imdbID}`}
                key={item.imdbID}
                onClick={(e) => e.ctrlKey ? undefined : setDisplaySearchResult(false)}
              >
                <p className='m-auto flex-[2]'>{item.Title}</p>
                <p className='m-auto flex-1 text-center'>{item.Year}</p>
              </Link>
            ))}
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
          <SelectValue className='flex justify-between' />
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
      {/*
      <Button className='flex-1'
        variant='outline'
        onClick={() => {
          console.log('go to search page')
        }}
      >Search</Button>
      */}
    </div>
  )
}
