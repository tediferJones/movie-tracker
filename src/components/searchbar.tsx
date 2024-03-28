'use client';
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

    console.log(searchTerm)
    if (!searchTerm) {
      setSearchResult(defaultState);
      return
    }

    let delaySetState: NodeJS.Timeout | undefined = setTimeout(() => {
      easyFetch<omdbSearch>('/api/search', 'GET', { 
        // use .trim(), because if you add a space after searchTerm, omdbAPI returns nothing
        searchTerm: searchTerm.trim(), 
        searchType, 
        queryTerm: 's', 
        queryType: 'type',
      }).then(data => {
          console.log('SEARCH RESULTS', data)
          data.Response === 'True' ? setSearchResult(data) : setSearchResult(defaultState);
        })
    }, 1000)

    return () => {
      console.log('clean up function')
      clearTimeout(delaySetState)
    }
  }, [searchTerm, searchType])

  return (
    <div className='m-auto flex w-4/5 justify-center py-4 gap-2'>
      <div className='relative flex w-full flex-col'>
        {!displaySearchResult ? [] : 
          <div id='findMe' className='fixed left-0 top-0 h-[100vh] w-[100vw]' 
            onClick={() => setDisplaySearchResult(false)}>
          </div> 
        }
        <input className='w-full text-2xl relative p-2 bg-transparent border-2'
          onFocus={() => setDisplaySearchResult(true)}
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='Search...'
        />
        {/* Search Results area */}
        <div className='absolute top-12 flex w-full flex-col items-center'>
          {!displaySearchResult ? [] : searchResult.Search.map((item: omdbSearchResult) => {
            return (
              <Link href={`/media/${item.imdbID}`} className='flex w-full flex-wrap bg-gray-700 p-2 rounded-none'
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
      <select className='cursor-pointer p-2 colorPrimary'
        value={searchType} 
        onChange={(e) => {
          setSearchResult(defaultState)
          setSearchType(e.target.value)
        }}
      > {['Movie', 'Series', 'Game'].map((searchTerm) => {
          return <option
            key={searchTerm}
            value={searchTerm.toLowerCase()}
          >{searchTerm}</option>
        })}
      </select>
    </div>
  )
}
