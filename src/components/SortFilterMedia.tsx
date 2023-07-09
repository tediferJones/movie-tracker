'use client';

import { useState, Fragment } from 'react';
import { media } from "@prisma/client";
import FilterCheckboxes from '@/components/FilterCheckboxes';
import FilterFromTo from '@/components/FilterFromTo';
import { getMinValue, getMaxValue, getUnqValues } from '@/modules/sortFilterMediaUtils'

// Move this to types file
interface test extends media {
  [key: string]: any
}

// ONLY FILTER NULLS IF FILTERS HAVE CHANGED FROM DEFAULT

// What other attributes could we potentially want to be able to sort by?
// Awards?, DVD, BoxOffice, imdbVotes, totalSeasons? (would only apply if Type='series')

// TO DO:
// Delete extranious comments
// Style the filters section of this component
// Address class naming for column headers, search for 'specialCases' to find it
// Add output count, i.e. how many items are in the list after filtering and sorting

export default function SortFilterMedia({ mediaArr, columns }: { mediaArr: media[], columns: { [key: string]: 'string' | 'array' | 'number' } }) {
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

  console.log(mediaArr);
  console.log(initialFilters);
  const [sortByColumnName, setSortByColumnName] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: any }>(initialFilters); // {

  function sortFunc(a: test, b: test) {
    // Sorts in ascending order, and pushes all nulls to front of array
    if (!a[sortByColumnName] || !b[sortByColumnName]) {
      return !a[sortByColumnName] ? -1 : 1;
    } else if (columns[sortByColumnName] === 'number') {
      return a[sortByColumnName] - b[sortByColumnName];
    } else if (columns[sortByColumnName] === 'string' || columns[sortByColumnName] === 'array') {
      return a[sortByColumnName] > b[sortByColumnName] ? 1 : -1;
    }
    return 0
  }

  // Replace this with a while loop, so it can break as soon as result is set to false
  // Object.keys(columns).forEach((columnName: string) => {
  //   // console.log(result)
  //   if (columnName === 'Title') {
  //     media.Title.toLowerCase().includes(filters.Title.toLowerCase()) ? undefined : result = false;
  //   } else if (columns[columnName] === 'array') {
  //     filters[columnName].includes(media[columnName]) ? undefined : result = false;
  //   } else if (columns[columnName] === 'number') {
  //     const min: boolean = media[columnName] ? media[columnName] <= filters['max' + columnName]
  //       : filters['min' + columnName] === initialFilters['min' + columnName];
  //     const max: boolean = media[columnName] ? media[columnName] >= filters['min' + columnName]
  //       : filters['min' + columnName] === initialFilters['min' + columnName];
  //
  //     min && max ? undefined : result = false;
  //   }
  // })


  function filterFunc(media: test) {
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

  // {Object.keys(columns).map((columnName: string) => {
  //   if (columns[columnName] === 'string') {
  //     return <input type='text' value={filters.Title} placeholder='Filter titles' onChange={(e) => setFilters({ ...filters, Title: e.target.value})}/>
  //   } else if (columns[columnName] === 'array') {
  //     return <FilterCheckboxes mediaKey={columnName} selectors={initialFilters[columnName]} filters={filters} setFilters={setFilters} />
  //   } else if (columns[columnName] === 'number') {
  //     return <FilterFromTo mediaKey={columnName} initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
  //   }
  // })}

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <button onClick={() => setReverseOrder(!reverseOrder)}>Display Order:{reverseOrder ? 'Descending' : 'Ascending'}</button>
      <button className='p-2 bg-red-500' onClick={() => setFilters(initialFilters)}>RESET FILTERS TO INITIAL STATE</button>
      <div className='text-black flex gap-4 flex-wrap justify-around'>
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
      </div>
      <div className='flex p-2 m-1'>
        {Object.keys(columns).map((columnName: string) => {
          const specialCases: { [key: string]: string } = { 
            IMDBRating: 'IMDB Rating', 
            RottenTomatoesRating: 'Rotten Tomatoes Rating',
            MetacriticRating: 'Metacritic Rating'
          }
          let className = 'flex-1';
          if (columnName === 'Title') {
            className = 'flex-[3]';
          }
          if (columnName === sortByColumnName) {
            className += ' bg-orange-400'
          }
          className += ' flex justify-center items-center'

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
        {mediaArr.filter(filterFunc).sort(sortFunc).map((item: test) => {
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
