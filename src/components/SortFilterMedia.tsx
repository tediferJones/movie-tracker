'use client';

import { useState, Fragment } from 'react';
import { media } from "@prisma/client";

// Move this to types file
interface test extends media {
  [key: string]: any
}

export default function SortFilterMedia({ media }: { media: media[] }) {
  console.log(media);
  const [sortBy, setSortBy] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    Title: '', // Contains this string
    Type: [], // movie, episode, series, or game
    Rated: [], // PG, TV-MA, its gunna be hard to hardcode all rating, should probably pull this info from root table
    minYear: 0, // Could go with positive infinite, but realisticly there will be no movie years before like 1850
    maxYear: 9999, // We have about 8000 years till we have to worry about this
    minRuntime: 0,
    maxRuntime: 9999, // maybe go with positive infinity for this one
    minIMDBRating: 0,
    maxIMDBRating: 100,
    minRottenTomatoesRating: 0,
    maxRottenTomatoesRating: 100,
    minMetacriticRating: 0,
    maxMetacriticRating: 100,
  })

  const columns = ['Title', 'Year', 'Type', 'Rated', 'Runtime', 'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating']

  // We need to determine how to handle null/undefined,
  // do we want to exclude those, or just push them to the end of the array?

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

  function sortFunc(a: test, b: test) {
    // This function sorts in ascending order by default
    // Just reverse the order to display in descending order

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
      minYear: () => media.Year > filters.minYear,
      maxYear: () => media.Year < filters.maxYear,
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
        <input type='text' value={filters.Title} onChange={(e) => setFilters({ ...filters, Title: e.target.value})}/>
        <input type='number' step={1} min={0} max={filters.maxYear} value={filters.minYear} onChange={(e) => setFilters({ ...filters, minYear: Number(e.target.value) })}/>
        <input type='number' step={1} min={filters.minYear} max={9999} value={filters.maxYear} onChange={(e) => setFilters({ ...filters, maxYear: Number(e.target.value) })}/>
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
