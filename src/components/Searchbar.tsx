'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { omdbSearch, omdbSearchResult } from '@/types';
import Link from 'next/link';
import easyFetch from '@/modules/easyFetch';

export default function Searchbar() {
  const defaultState: omdbSearch = {
    Search: [],
    Response: 'False',
    totalResults: '0',
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [searchResult, setSearchResult] = useState(defaultState);
  const [displaySearchResult, setDisplaySearchResult] = useState<true | false>(true)

  // By default, set showDropDown to false
  // When user starts typing set shopDropDown to true
  // on click of link, toggle showDropDown to false

  useEffect(() => {
    const delaySetState = setTimeout(() => {
      easyFetch('/api/search', 'GET', { 
        // use .trim(), because if you add a space after searchTerm, omdbAPI returns nothing
        searchTerm: searchTerm.trim(), 
        searchType, 
        queryTerm: 's', 
        queryType: 'type',
      }).then((res: Response) => res.json())
        .then((data: omdbSearch) => {
          console.log('SEARCH RESULTS', data)
          console.log(displaySearchResult)
          data.Response === 'True' ? setSearchResult(data) : setSearchResult(defaultState);
        })
    }, 1000)

    return () => clearTimeout(delaySetState)
  }, [searchTerm, searchType])

  return (
    <div className='m-auto flex w-4/5 justify-center p-4'>
      <label className='my-auto p-2'>SEARCH</label>
      <div className='relative flex w-full flex-col'>
        <input className='border-color-gray-400 w-full border-8 text-2xl text-black'
          onFocus={() => setDisplaySearchResult(true)}
          onBlur={() => setDisplaySearchResult(false)}
          type='text'
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        {/* Search Results area */}
        <div className='absolute top-12 flex w-full flex-col items-center'>
          {!displaySearchResult ? [] : searchResult.Search.map((item: omdbSearchResult) => {
            return (
              <Link href={`/media/${item.imdbID}`} className='flex flex-wrap w-full bg-gray-700 p-2'
                key={item.Title + item.Year.toString()}>
                <p className='m-auto flex-[2]'>{item.Title}</p>
                <p className='m-auto flex-1'>{item.Year}</p>
              </Link>
            )
          })}
        </div>
      </div>
      {/* Selector for media type */}
      <select className='bg-gray-700 p-2 text-center cursor-pointer'
        value={searchType} 
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSearchType(e.target.value)}
      >
        {['Movie', 'Series', 'Game'].map((searchTerm: string) => {
          return <option key={searchTerm} value={searchTerm.toLowerCase()}>{searchTerm}</option>
        })}
      </select>
    </div>
  )
}
