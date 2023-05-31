'use client';
import { useState, useEffect } from 'react';
import { omdbSearch, omdbSearchResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import LinkToMovie from '@/components/LinkToMovie';

export default function Searchbar() {
  const defaultState: omdbSearch = {
    Search: [],
    Response: 'False',
    totalResults: '0',
  }

  const [searchTerm, setSearchTerm] = useState('The Deluge');
  const [searchResult, setSearchResult] = useState(defaultState);

  useEffect(() => {
    const delaySetState = setTimeout(() => {
      // console.log(searchTerm)
      // Cant use easyFetch here, but thats okay, this should be the only place that directly queries omdbAPI
      fetch(`http://www.omdbapi.com/?apikey=8e1df54b&s=${searchTerm}`)
          .then((res: any) => res.json())
          .then((data: omdbSearch) => {
            console.log('SEARCH RESULTS', data)
            if (data.Response === 'True') {
              // console.log('SETTING STATE')
              setSearchResult(data);
            } else {
              setSearchResult(defaultState);
            }
          })
    }, 1000)

    return () => clearTimeout(delaySetState)
  }, [searchTerm])

  return (
    <div className='flex flex-col items-center'>
      <div className='w-4/5 flex'>
        <label className='flex justify-center items-center'>SEARCH</label>
        <div className='flex-1 flex flex-col'>
          <input className='flex-1 text-2xl border-8 border-color-gray-400'
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchResult.Search.map((item: omdbSearchResult) => {
            return (
              <div className='flex justify-between'
                key={uuidv4()}
              >
                <p className='flex-[2]'>{item.Title}</p>
                <p className='flex-1'>{item.Year}</p>
                <LinkToMovie imdbID={item.imdbID}/>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
