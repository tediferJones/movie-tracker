'use client';

import { useState, Fragment } from 'react';
import { media } from "@prisma/client";

// Move this to types file
interface test extends media {
  [key: string]: any
}

// What attributes do we want to be able to sort by?
// [ DONE ] Title
// [ DONE ] Year
// [ DONE ] Rated
// [ DONE ] Runtime
// Awards? Can only really do "has awards" or 'doesnt have awards'
// [ DONE ] Type
// DVD release? Seems kind of useless
// BoxOffice, sort by profits
// imdbVotes
// [ DONE ] IMDBRating
// [ DONE ] RottenTomatoesRating
// [ DONE ] MetacriticRating
// totalSeasons? Only exists on Type='series'

export default function SortFilterMedia({ media }: { media: media[] }) {
  console.log(media);
  const [sortBy, setSortBy] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    Title: '', // Contains this string
    Type: getUnqValues('Type'),// [...new Set(media.map((item: media) => item.Type))],// [], // movie, episode, series, or game
    Rated: getUnqValues('Rated'), // PG, TV-MA, its gunna be hard to hardcode all rating, should probably pull this info from root table
    minYear: getMinValue('Year'),// Math.min(...media.map(item => item.Year)), // Could go with positive infinite, but realisticly there will be no movie years before like 1850
    maxYear: getMaxValue('Year'),// Math.max(...media.map(item => item.Year)), // We have about 8000 years till we have to worry about this
    minRuntime: getMinValue('Runtime'),
    maxRuntime: getMaxValue('Runtime'), // maybe go with positive infinity for this one
    minIMDBRating: 0,
    maxIMDBRating: 100,
    minRottenTomatoesRating: 0,
    maxRottenTomatoesRating: 100,
    minMetacriticRating: 0,
    maxMetacriticRating: 100,
  })

  function getMinValue(key: string): number {
    let result: number = Infinity;
    media.forEach((item: test) => {
      if (item[key] && item[key] < result) {
        result = item[key]
      }
    })
    return result;
  }

  function getMaxValue(key: string): number {
    let result: number = -Infinity;
    media.forEach((item: test) => {
      if (item[key] && item[key] > result) {
        result = item[key];
      }
    })
    return result;
  }

  function getUnqValues(key: string): string[] {
    let result: string[] = [];
    media.forEach((item: test) => {
      if (item[key] && !result.includes(item[key])) {
        result.push(item[key])
      }
    })
    return result;
  }

  const columns = ['Title', 'Year', 'Type', 'Rated', 'Runtime', 'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating']


  function sortFunc(a: test, b: test) {
    // This function sorts in ascending order by default
    // Toggle class to reverse ordering

    const typeIsNumber = ['Year', 'Runtime',  'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating'];

    const typeIsString = ['Title', 'Type', 'Rated']

    // Push all null values to end of array
    if (!a[sortBy]) {
      return 1;
    }
    if (!b[sortBy]) {
      return -1
    }

    // These keys have type number
    if (typeIsNumber.includes(sortBy)) {
      return a[sortBy] - b[sortBy]
    }
    // These keys have type string
    if (typeIsString.includes(sortBy)) {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return 0
  }

  function filterFunc(media: test) {
    const specialCases: { [key: string]: Function } = {
      // Every expression here should return true or false
      Title: () => media.Title.includes(filters.Title),
      Type: () => filters.Type.includes(media.Type),
      minYear: () => media.Year >= filters.minYear,
      maxYear: () => media.Year <= filters.maxYear,
      minRuntime: () => media.Runtime ? media.Runtime >= filters.minRuntime : filters.minRuntime === getMinValue('Runtime') ? true : false,
      maxRuntime: () => media.Runtime ? media.Runtime <= filters.maxRuntime : true,
    }
    let result = true;

    // for each media iterate over every key in special cases, if any of the test cases fail, return false
    // if it passes all tests, return true
    Object.keys(specialCases).forEach((key: string) => {
      specialCases[key]() ? undefined : result = false;
    })
    return result;
  }

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <button onClick={() => setReverseOrder(!reverseOrder)}>Display Order:{reverseOrder ? 'Descending' : 'Ascending'}</button>
      <div className='text-black flex gap-4'>
        {/* PUT FILTERS HERE */}
        <input type='text' value={filters.Title} placeholder='Filter titles' onChange={(e) => setFilters({ ...filters, Title: e.target.value})}/>
        <input type='number' step={1} min={Math.min(...media.map(item => item.Year))} max={filters.maxYear} value={filters.minYear} onChange={(e) => setFilters({ ...filters, minYear: Number(e.target.value) })}/>
        <input type='number' step={1} min={filters.minYear} max={Math.max(...media.map(item => item.Year))} value={filters.maxYear} onChange={(e) => setFilters({ ...filters, maxYear: Number(e.target.value) })}/>

        <input type='number' step={1} min={getMinValue('Runtime')} max={filters.maxRuntime} value={filters.minRuntime} onChange={(e) => setFilters({ ...filters, minRuntime: Number(e.target.value) })}/>
        <input type='number' step={1} min={filters.minRuntime} max={getMaxValue('Runtime')} value={filters.maxRuntime} onChange={(e) => setFilters({ ...filters, maxRuntime: Number(e.target.value) })}/>

        <input name='movie' type='checkbox' defaultChecked={true} onChange={(e) => e.target.checked ? setFilters({ ...filters, Type: filters.Type.concat('movie') }) : setFilters({ ...filters, Type: filters.Type.filter((type: string) => type !== 'movie')})}/>
        <label htmlFor='movie' className='text-white'>Movies</label>

        {// filters.Type
          getUnqValues('Type').map((type: string) => {
          return (
            <>
              <input name={type} type='checkbox' defaultChecked={true} 
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters({ ...filters, Type: filters.Type.concat(type)})
                  } else {
                    setFilters({
                      ...filters,
                      Type: filters.Type.filter((existingType: string) => existingType !== type)
                    })
                  }
                }} />
              <label htmlFor={type} className='text-white'>{type}</label>
            </>
          )
        })}

        <div className='text-white'>
          {JSON.stringify(filters.Type)}
          {JSON.stringify(filters.Rated)}
        </div>
      </div>
      <div className='flex p-2 m-1'>
        {columns.map((column: string) => {
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
        {media.filter(filterFunc).sort(sortFunc).map((item: test) => {
          return (
            <a className='flex justify-between p-2 m-1 bg-gray-700'
              key={item.imdbID}
              href={`/media/${item.imdbID}`}
            > {columns.map((key: string, i: number) => {
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
