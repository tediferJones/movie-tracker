'use client';

import { useState, Fragment } from 'react';
import { media } from "@prisma/client";
import FilterCheckboxes from '@/components/FilterCheckboxes';
import FilterFromTo from '@/components/FilterFromTo';
// import { getMinValue, getMaxValue, getUnqValues } from '@/modules/sortFilterMediaUtils';
import { getMinValue, getMaxValue, getUnqValues } from '@/modules/sortFilterMediaUtils'

// Move this to types file
interface test extends media {
  [key: string]: any
}

// ONLY FILTER NULLS IF FILTERS HAVE CHANGED FROM DEFAULT

// What other attributes could we potentially want to be able to sort by?
// Awards?, DVD, BoxOffice, imdbVotes, totalSeasons? (would only apply if Type='series')

// Add ID's to some of the checkboxes/labels, see if that makes it so that when you click the label it toggles the input
// Add some kind of indicator to colmn headers, indicate if the column is selected and the direction of sorting
// Rename all occurances of 'column' to either 'columnName' or 'columnValue'
// Rename columnsV2, sortFuncV2, and FilterFuncV2
// Simplify sortFunc 
// Move getMinValue, getMaxValue, getUniqueValues to their own module, maybe name it SortFilterMediaUtils
// Consider renaming sortBy
// Delete extranious comments
// change references for min and max to the values from filters state obj
// MAKE TITLE SEARCH NOT CASE SENSITIVE
// Simplify sortFilterMediaUtils

export default function SortFilterMedia({ media }: { media: media[] }) {
  const columnsV2: { [key: string]: string } = {
    Title: 'string',
    Type: 'array',
    Rated: 'array',
    Year: 'number',
    Runtime: 'number',
    IMDBRating: 'number',
    RottenTomatoesRating: 'number',
    MetacriticRating: 'number',
  }
  // string | number | (string | null)[] 
  let initialFilters: { [key: string]: any } = {}
  Object.keys(columnsV2).forEach((columnName: string) => {
    if (columnName === 'Title') {
      initialFilters[columnName] = ''
    } else if (columnsV2[columnName] === 'array') {
      initialFilters[columnName] = getUnqValues(columnName, media)
    } else if (columnsV2[columnName] === 'number') {
      initialFilters['min' + columnName] = getMinValue(columnName, media);
      initialFilters['max' + columnName] = getMaxValue(columnName, media);
    }
  })

  console.log(media);
  console.log(initialFilters);
  const [sortBy, setSortBy] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: any }>(initialFilters); // {

  function sortFuncV2(a: test, b: test) {
    // Sorts in ascending order, and pushes all nulls to front of array
    if (!a[sortBy] || !b[sortBy]) {
      return !a[sortBy] ? -1 : 1;
    } else if (columnsV2[sortBy] === 'number') {
      return a[sortBy] - b[sortBy];
    } else if (columnsV2[sortBy] === 'string' || columnsV2[sortBy] === 'array') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return 0
  }

  function filterFuncV2(media: test) {
    let result = true;

    // Replace this with a while loop, so it can break as soon as result is set to false
    Object.keys(columnsV2).forEach((column: string) => {
      // console.log(result)
      if (column === 'Title') {
        media.Title.includes(filters.Title) ? undefined : result = false;
      } else if (columnsV2[column] === 'array') {
        filters[column].includes(media[column]) ? undefined : result = false;
      } else if (columnsV2[column] === 'number') {
        // testNumber(column) ? undefined : result = false;
        const min: boolean = media[column] ? media[column] <= filters['max' + column]
          : filters['min' + column] === initialFilters['min' + column] // getMinValue(column)
        const max: boolean = media[column] ? media[column] >= filters['min' + column]
          : filters['min' + column] === initialFilters['min' + column]// getMinValue(column)

        min && max ? undefined : result = false;
      }
    })

    return result;
  }

  // {Object.keys(columnsV2).map((columnName: string) => {
  //   if (columnsV2[columnName] === 'string') {
  //     return <input type='text' value={filters.Title} placeholder='Filter titles' onChange={(e) => setFilters({ ...filters, Title: e.target.value})}/>
  //   } else if (columnsV2[columnName] === 'array') {
  //     return <FilterCheckboxes mediaKey={columnName} selectors={initialFilters[columnName]} filters={filters} setFilters={setFilters} />
  //   } else if (columnsV2[columnName] === 'number') {
  //     return <FilterFromTo mediaKey={columnName} initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
  //   }
  // })}

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <button onClick={() => setReverseOrder(!reverseOrder)}>Display Order:{reverseOrder ? 'Descending' : 'Ascending'}</button>
      <button className='p-2 bg-red-500' onClick={() => setFilters(initialFilters)}>RESET FILTERS TO INITIAL STATE</button>
      <div className='text-black flex gap-4'>
        
        {/* PUT FILTERS HERE */}
        <input type='text' value={filters.Title} placeholder='Filter titles' onChange={(e) => setFilters({ ...filters, Title: e.target.value})}/>

        <FilterFromTo mediaKey='Year' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='Runtime' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='IMDBRating' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='RottenTomatoesRating' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='MetacriticRating' initialFilters={initialFilters} filters={filters} setFilters={setFilters} />

        <FilterCheckboxes selectors={initialFilters.Type} mediaKey='Type' filters={filters} setFilters={setFilters} />
        <FilterCheckboxes selectors={initialFilters.Rated} mediaKey='Rated' filters={filters} setFilters={setFilters} />
      </div>
      <div className='flex p-2 m-1'>
        {// columns.map((column: string) => {
          Object.keys(columnsV2).map((column: string) => {
          const specialCases: { [key: string]: string } = { 
            IMDBRating: 'IMDB Rating', 
            RottenTomatoesRating: 'Rotten Tomatoes Rating',
            MetacriticRating: 'Metacritic Rating'
          }

          return (
            <button className={column === 'Title' ? 'flex-[3]' : 'flex-1'} 
              onClick={() => sortBy === column ? setReverseOrder(!reverseOrder) : setSortBy(column)}
              key={column}
            >{Object.keys(specialCases).includes(column) ? specialCases[column] : column}</button>
          )
        })}
      </div>
      <div className={reverseOrder ? 'flex flex-col-reverse' : 'flex flex-col'}>
        {media.filter(filterFuncV2).sort(sortFuncV2).map((item: test) => {
          return (
            <a className='flex justify-between p-2 m-1 bg-gray-700'
              key={item.imdbID}
              href={`/media/${item.imdbID}`}
            > {// columns.map((key: string, i: number) => {
                Object.keys(columnsV2).map((key: string, i: number) => {
                const specialCases: { [key: string]: Function } = { 
                  IMDBRating: () => `${(item[key] / 10).toFixed(1)}/10`,
                  RottenTomatoesRating: () => `${item[key]}%`,
                  MetacriticRating: () => `${item[key]}/100`,
                  Runtime: () => `${item[key]} mins`
                }

                return (
                  <Fragment key={`${item.imdbID}-${key}`}>
                    {i > 0 ? <div className='w-0.5 bg-gray-400'></div> : []}
                    <h3 className={key === 'Title' ? 'flex-[3] text-center my-auto' : 'flex-1 text-center my-auto'}> 
                      {!item[key] ? 'N/A' 
                        : Object.keys(specialCases).includes(key) ? specialCases[key]()
                        : item[key]
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
