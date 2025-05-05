'use client';

import Loading from '@/components/subcomponents/loading';
import SearchResults from '@/components/subcomponents/searchResults';
import easyFetchV3 from '@/lib/easyFetchV3';
import { OmdbSearch, OmdbSearchResult } from '@/types';
import { useEffect, useRef, useState } from 'react';

export default function Search() {
  const [searchResult, setSearchResult] = useState<OmdbSearch>();
  const [pageCount, setPageCount] = useState(2);
  const observed = useRef(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', pageCount.toString());

    easyFetchV3<OmdbSearch>({
      route: '/api/search',
      method: 'GET',
      params: params,
    }).then(data => setSearchResult(data));
  }, [pageCount]);

  useEffect(() => {
    if (!observed.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.length > 1) throw Error('too many entries')
        const [ entry ] = entries
        if (entry.isIntersecting) {
          console.log('shit do be intersecting')
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observed.current);
  }, [observed.current])

  {/*
  <p>{JSON.stringify(searchResult, undefined, 2)}</p>
  */}
  console.log(searchResult)
  return (
    <div className='showOutline w-4/5 mx-auto p-4 mb-4'>
      {!searchResult ? <Loading /> :
        searchResult.Response !== 'True' ? <div>{(searchResult as any).Error}</div> :
          <div className='flex flex-col gap-4'>
            <span className='text-center'>Displaying {searchResult.Search.length} out of {searchResult.totalResults}</span>
            <SearchResults results={searchResult.Search} />
            <div className='text-center' ref={observed}>If visible get more results</div>
          </div>
      }
    </div>
  )
}
