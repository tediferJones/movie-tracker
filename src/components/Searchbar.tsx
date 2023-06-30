'use client';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
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
  const [displaySearchResult, setDisplaySearchResult] = useState<true | false>(false)
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let delaySetState: any;

    if (searchTerm !== '') {
      delaySetState = setTimeout(() => {
        easyFetch('/api/search', 'GET', { 
          // use .trim(), because if you add a space after searchTerm, omdbAPI returns nothing
          searchTerm: searchTerm.trim(), 
          searchType, 
          queryTerm: 's', 
          queryType: 'type',
        }).then((res: Response) => res.json())
          .then((data: omdbSearch) => {
            console.log('SEARCH RESULTS', data)
            data.Response === 'True' ? setSearchResult(data) : setSearchResult(defaultState);
          })
      }, 1000)
    }

    return () => clearTimeout(delaySetState)
  }, [searchTerm, searchType])

  return (
    <div className='m-auto flex w-4/5 justify-center p-4'>
      <label className='my-auto p-3'>SEARCH</label>
      <div className='relative flex w-full flex-col'>
        {!displaySearchResult ? [] : 
          <div className='fixed left-0 top-0 h-[100vh] w-[100vw]' 
            onClick={() => setDisplaySearchResult(false)}>
          </div> 
        }
        <input className='w-full text-2xl text-black relative h-full p-2'
          ref={ref}
          onFocus={() => setDisplaySearchResult(true)}
          type='text'
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        {/* Search Results area */}
        <div className='absolute top-12 flex w-full flex-col items-center'>
          {!displaySearchResult ? [] : searchResult.Search.map((item: omdbSearchResult) => {
            return (
              <Link href={`/media/${item.imdbID}`} className='flex w-full flex-wrap bg-gray-700 p-2'
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
      <select className='cursor-pointer bg-gray-700 p-2 text-center relative'
        value={searchType} 
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          setSearchResult(defaultState)
          setSearchType(e.target.value)
          ref.current?.focus()
        }}
      > {['Movie', 'Series', 'Game'].map((searchTerm: string) => {
          return <option key={searchTerm} value={searchTerm.toLowerCase()}>{searchTerm}</option>
        })}
      </select>
    </div>
  )
}
