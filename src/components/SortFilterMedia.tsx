'use client';

import { useState, Fragment } from 'react';
import { strIdxMedia } from '@/types';
import { getMinValue, getMaxValue, getUnqValues } from '@/modules/sortFilterMediaUtils'
import FilterCheckboxes from '@/components/FilterCheckboxes';
import FilterFromTo from '@/components/FilterFromTo';

// What other attributes could we potentially want to be able to sort by?
// Awards?, DVD, BoxOffice, imdbVotes, totalSeasons? (would only apply if Type='series')

// TO DO:
// Delete extranious comments
// Style the filters section of this component
// Do we want to make a type for this component?  
//   - Is that even possible given that this component can output different numbers of columns?

export default function SortFilterMedia({
  mediaArr,
  columns,
}: {
  mediaArr: strIdxMedia[],
  columns: { [key: string]: 'string' | 'array' | 'number' },
}) {
  if (Object.keys(columns).length === 0) {
    columns = {
      Title: 'string',
      Year: 'number',
      Runtime: 'number',
      IMDBRating: 'number',
      RottenTomatoesRating: 'number',
      MetacriticRating: 'number',
      Type: 'array',
      Rated: 'array',
    }
  }
  // string | number | (string | null)[] 
  let initialFilters: { [key: string]: any } = {}
  Object.keys(columns).forEach((columnName: string) => {
    if (columnName === 'Title') {
      initialFilters[columnName] = ''
    } else if (columns[columnName] === 'array') {
      initialFilters[columnName] = getUnqValues(columnName, mediaArr)
    } else if (columns[columnName] === 'number') {
      initialFilters['min' + columnName] = getMinValue(columnName, mediaArr);
      initialFilters['max' + columnName] = getMaxValue(columnName, mediaArr);
    }
  })

  // console.log(mediaArr);
  // console.log(initialFilters);
  const [sortByColumnName, setSortByColumnName] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: any }>(initialFilters); // {

  function sortFunc(a: strIdxMedia, b: strIdxMedia) {
    // Sort in ascending order, and push all nulls to front of array
    if (!a[sortByColumnName] || !b[sortByColumnName]) {
      return !a[sortByColumnName] ? -1 : 1;
    } else if (columns[sortByColumnName] === 'number') {
      return a[sortByColumnName] - b[sortByColumnName];
    } else if (columns[sortByColumnName] === 'string' || columns[sortByColumnName] === 'array') {
      return a[sortByColumnName] > b[sortByColumnName] ? 1 : -1;
    }
    return 0
  }

  function filterFunc(media: strIdxMedia) {
    // Only filter out null values if filters have changed from their initial values
    let result = true;

    const keys = Object.keys(columns);

    for (let i = 0; i < keys.length && result; i++) {
      if (columns[keys[i]] === 'string') {
        media.Title.toLowerCase().includes(filters.Title.toLowerCase()) ? undefined : result = false;
      } else if (columns[keys[i]] === 'array') {
        filters[keys[i]].includes(media[keys[i]]) ? undefined : result = false;
      } else if (columns[keys[i]] === 'number') {
        const min: boolean = media[keys[i]] ? media[keys[i]] <= filters['max' + keys[i]]
          : filters['min' + keys[i]] === initialFilters['min' + keys[i]];
        const max: boolean = media[keys[i]] ? media[keys[i]] >= filters['min' + keys[i]]
          : filters['min' + keys[i]] === initialFilters['min' + keys[i]];

        min && max ? undefined : result = false;
      }
    }

    return result;
  }

  const sortedAndFilteredMediaArr = mediaArr.filter(filterFunc).sort(sortFunc);

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <button onClick={() => setReverseOrder(!reverseOrder)}>Display Order:{reverseOrder ? 'Descending' : 'Ascending'}</button>
      <button className='p-2 bg-red-500' onClick={() => setFilters(initialFilters)}>RESET FILTERS TO INITIAL STATE</button>
      <div className='text-black flex gap-4 flex-wrap justify-around'>
        {Object.keys(columns).map((columnName: string) => {
          let result;
          if (columns[columnName] === 'string') {
            result = <div className='my-auto' key={columnName}>
              <label className='text-white mr-2' htmlFor='title'>Filter Title</label>
              <input id='title'
                type='text'
                value={filters.Title}
                placeholder='Filter titles' 
                onChange={(e) => setFilters({ ...filters, Title: e.target.value})}
              />
            </div>
          } else if (columns[columnName] === 'array') {
            result = <FilterCheckboxes selectors={initialFilters[columnName]} 
              mediaKey={columnName} 
              filters={filters} 
              setFilters={setFilters} 
              key={columnName}
            />
          } else if (columns[columnName] === 'number') {
            result = <FilterFromTo mediaKey={columnName} 
              initialFilters={initialFilters} 
              filters={filters} 
              setFilters={setFilters} 
              key={columnName}
            />
          }
          return result;
        })}
        {/*
        <div className='my-auto'>
          <label className='text-white mr-2' htmlFor='title'>Filter Title</label>
          <input id='title' type='text' value={filters.Title} placeholder='Filter titles' onChange={(e) => setFilters({ ...filters, Title: e.target.value})}/>
        </div>

        <FilterFromTo mediaKey='Year' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='Runtime' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='IMDBRating' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='RottenTomatoesRating' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='MetacriticRating' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />

        <FilterCheckboxes selectors={initialFilters.Type} mediaKey='Type' filters={filters} setFilters={setFilters} />
        <FilterCheckboxes selectors={initialFilters.Rated} mediaKey='Rated' filters={filters} setFilters={setFilters} />
        */}
      </div>
      <div>Filtered Length: {sortedAndFilteredMediaArr.length}</div>
      <div className='flex p-2 m-1'>
        {Object.keys(columns).map((columnName: string) => {
          const specialCases: { [key: string]: string } = { 
            IMDBRating: 'IMDB Rating', 
            RottenTomatoesRating: 'Rotten Tomatoes Rating',
            MetacriticRating: 'Metacritic Rating'
          }

          let className = 'flex-1 flex justify-center items-center';
          if (columnName === 'Title') className = className.replace('1', '[3]')
          if (columnName === sortByColumnName) className += ' bg-orange-400'

          return (
            <button className={className}
              onClick={() => sortByColumnName === columnName ? setReverseOrder(!reverseOrder) : setSortByColumnName(columnName)}
              key={columnName}
            > {Object.keys(specialCases).includes(columnName) ? specialCases[columnName] : columnName}
              {sortByColumnName !== columnName ? '' :
                reverseOrder ? <p>&darr;</p> : <p>&uarr;</p>
              }
            </button>
          )
        })}
      </div>
      <div className={reverseOrder ? 'flex flex-col-reverse' : 'flex flex-col'}>
        {// mediaArr.filter(filterFunc).sort(sortFunc)
          sortedAndFilteredMediaArr.map((item: strIdxMedia) => {
          return (
            <a className='flex justify-between p-2 m-1 bg-gray-700'
              key={item.imdbID}
              href={`/media/${item.imdbID}`}
            > {Object.keys(columns).map((columnName: string, i: number) => {
                const specialCases: { [key: string]: Function } = { 
                  IMDBRating: () => `${(item[columnName] / 10).toFixed(1)}/10`,
                  RottenTomatoesRating: () => `${item[columnName]}%`,
                  MetacriticRating: () => `${item[columnName]}/100`,
                  Runtime: () => `${item[columnName]} mins`
                }

                return (
                  <Fragment key={`${item.imdbID}-${columnName}`}>
                    {i > 0 ? <div className='w-0.5 bg-gray-400'></div> : []}
                    <h3 className={columnName === 'Title' ? 'flex-[3] text-center my-auto' : 'flex-1 text-center my-auto'}> 
                      {!item[columnName] ? 'N/A' 
                        : Object.keys(specialCases).includes(columnName) ? specialCases[columnName]()
                        : item[columnName]
                      }
                    </h3>
                  </Fragment>
                )
              })}
            </a>
          )
        })}
      </div>
    </div>
  )
}
