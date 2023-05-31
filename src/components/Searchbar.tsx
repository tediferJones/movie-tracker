'use client';
import { useState, useEffect } from 'react';
import { omdbSearch, omdbSearchResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';
// import LinkToMovie from '@/components/LinkToMovie';
import { useRouter } from 'next/navigation';

export default function Searchbar() {
  const defaultState: omdbSearch = {
    Search: [],
    Response: 'False',
    totalResults: '0',
  }
  const router = useRouter();
  // router.push('/movies/tt0072021')

  const [searchTerm, setSearchTerm] = useState('The Deluge');
  const [searchResult, setSearchResult] = useState(defaultState);

  useEffect(() => {
    const delaySetState = setTimeout(() => {
      // console.log(searchTerm)
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

  // <LinkToMovie imdbID={item.imdbID}/>

  async function checkDb(e: any) {
    console.log(e.target.value)
    const test = await fetch('/api/movies?' + new URLSearchParams({ imdbID: e.target.value }), { method: 'HEAD' });
    console.log(test.status);
    // router.push('/movies/tt0072021')
    // return
  }

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
                <a className='flex-1' 
                  href={`/movies/${item.imdbID}`}
                >LINK</a>
                <button onClick={checkDb} value={item.imdbID}>New Link to Movie</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
