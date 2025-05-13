'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Loading from '@/components/subcomponents/loading';
import SearchResults from '@/components/subcomponents/searchResults';
import AutoPaging from '@/components/subcomponents/AutoPaging';
import easyFetchV3 from '@/lib/easyFetchV3';
import { OmdbSearch } from '@/types';

export default function Search() {
  const params = useSearchParams();
  const [searchResult, setSearchResult] = useState<OmdbSearch>();
  const [pageCount, setPageCount] = useState(1);
  const [oldParams, setOldParams] = useState(params.toString());

  useEffect(() => {
    if (oldParams !== params.toString()) {
      setOldParams(params.toString());
      window.location.reload();
    }
  }, [params]);

  useEffect(() => {
    console.log('fetching results')
    const newParams = new URLSearchParams(params.toString());
    newParams.set('page', pageCount.toString());

    easyFetchV3<OmdbSearch>({
      route: '/api/search',
      method: 'GET',
      params: newParams,
    }).then(data => {
        if (data.Response === 'True') {
          setSearchResult({
            Search: (searchResult?.Response === 'True' ? searchResult.Search : []).concat(data.Search),
            Response: 'True',
            totalResults: data.totalResults,
          });
        } else {
          setSearchResult({
            Response: 'False',
            Error: data.Error,
          });
        }
      });
  }, [pageCount]);

  return (
    <div className='showOutline w-4/5 mx-auto p-4 mb-4'>
      {!searchResult ? <Loading /> :
        searchResult.Response === 'False' ? <div className='text-center'>{searchResult.Error}</div> :
          <div className='flex flex-col gap-4'>
            <span className='text-center'>Displaying {searchResult.Search.length} out of {searchResult.totalResults}</span>
            <SearchResults results={searchResult.Search} />
            <AutoPaging setPage={setPageCount}
              currentCount={searchResult.Search.length}
              maxCount={Number(searchResult.totalResults)}
            />
          </div>
      }
    </div>
  )
}
