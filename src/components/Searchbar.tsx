'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { omdbSearch, omdbSearchResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import LinkToMedia from '@/components/LinkToMedia';
import easyFetch from '@/modules/easyFetch';

export default function Searchbar() {
  const defaultState: omdbSearch = {
    Search: [],
    Response: 'False',
    totalResults: '0',
  }

  const [searchTerm, setSearchTerm] = useState('The Deluge');
  const [searchType, setSearchType] = useState('movie');
  const [searchResult, setSearchResult] = useState(defaultState);

  useEffect(() => {
    const delaySetState = setTimeout(() => {
      easyFetch('/api/search', 'GET', { searchTerm, searchType, queryTerm: 's', queryType: 'type' })
          .then((res: Response) => res.json())
          .then((data: omdbSearch) => {
            console.log('SEARCH RESULTS', data)
            if (data.Response === 'True') {
              setSearchResult(data);
            } else {
              setSearchResult(defaultState);
            }
          })
    }, 1000)

    return () => clearTimeout(delaySetState)
  }, [searchTerm, searchType])

  return (
    <>
      <div className='flex justify-center'>
        <label className='p-2 my-auto'>SEARCH</label>
        <input className='w-1/2 text-2xl border-8 border-color-gray-400 text-black'
          type='text'
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        <select className='p-2 text-center bg-gray-700'
          value={searchType} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setSearchType(e.target.value)}
        >
          {['Movie', 'Series', 'Game'].map((searchTerm: string) => {
            return (
              <option key={searchTerm} value={searchTerm.toLowerCase()}>{searchTerm}</option>
            )
          })}
        </select>
      </div>

      <div className='flex flex-col items-center absolute w-full pointer-events-none'>
          {searchResult.Search.map((item: omdbSearchResult) => {
            return (
              <div className='flex justify-center w-1/2 bg-gray-700 p-2 pointer-events-auto'
                key={uuidv4()}
              >
                <p className='flex-[2]'>{item.Title}</p>
                <p className='flex-1'>{item.Year}</p>
                <LinkToMedia imdbID={item.imdbID}/>
              </div>
            )
          })}
      </div>
    </>
  )
}
