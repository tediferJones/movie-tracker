'use client';

import { useState, Fragment } from 'react';
import { media } from "@prisma/client";
import FilterCheckboxes from '@/components/FilterCheckboxes';
import FilterFromTo from '@/components/FilterFromTo';

// Move this to types file
interface test extends media {
  [key: string]: any
}

// WE ARE FILTERING OUT NULL VALUES, ONLY FILTER NULLS IF FILTERS HAVE CHANGED FROM DEFAULT

// What other attributes do we want to be able to sort by?
// Awards? Can only really do "has awards" or 'doesnt have awards'
// DVD release? Seems kind of useless
// BoxOffice, sort by profits
// imdbVotes
// totalSeasons? Only exists on Type='series'

// Add ID's to some of the checkboxes/labels, see if that makes it so that when you click the label it toggles the input

export default function SortFilterMedia({ media }: { media: media[] }) {
  console.log(media);
  const [sortBy, setSortBy] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: any }>({
    // MAKE TITLE SEARCH NOT CASE SENSITIVE
    Title: '', // Contains this string
    Type: getUnqValues('Type'),// [...new Set(media.map((item: media) => item.Type))],// [], // movie, episode, series, or game
    Rated: getUnqValues('Rated'), // PG, TV-MA, its gunna be hard to hardcode all rating, should probably pull this info from root table
    minYear: getMinValue('Year'),// Math.min(...media.map(item => item.Year)), // Could go with positive infinite, but realisticly there will be no movie years before like 1850
    maxYear: getMaxValue('Year'),// Math.max(...media.map(item => item.Year)), // We have about 8000 years till we have to worry about this
    minRuntime: getMinValue('Runtime'),
    maxRuntime: getMaxValue('Runtime'), // maybe go with positive infinity for this one
    minIMDBRating: getMinValue('IMDBRating'),
    maxIMDBRating: getMaxValue('IMDBRating'),
    minRottenTomatoesRating: getMinValue('RottenTomatoesRating'),
    maxRottenTomatoesRating: getMaxValue('RottenTomatoesRating'),
    minMetacriticRating: getMinValue('MetacriticRating'),
    maxMetacriticRating: getMaxValue('MetacriticRating'),
  })
  const columns = ['Title', 'Year', 'Type', 'Rated', 'Runtime', 'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating']
  const columnsV2: { [key: string]: string } = {
    'Title': 'string',
    'Type': 'array',
    'Rated': 'array',
    'Year': 'number',
    'Runtime': 'number',
    'IMDBRating': 'number',
    'RottenTomatoesRating': 'number',
    'MetacriticRating': 'number',
  }

  // consider moving the below three functions to their own module, maybe called sortFilterMediaUtils
  function getMinValue(key: string): number {
    let result: number = Infinity;
    // media.forEach((item: test) => item[key] && item[key] < result ? undefined : result = item[key])
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

  function getUnqValues(key: string): (string | null)[] {
    let result: (string | null)[] = [];
    media.forEach((item: test) => {
      if (!result.includes(item[key])) {
        result.push(item[key])
      }
    })
    return result.sort();
  }

  function sortFunc(a: test, b: test) {
    // This function sorts in ascending order by default
    // Toggle class to reverse ordering

    const typeIsNumber = ['Year', 'Runtime',  'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating'];

    const typeIsString = ['Title', 'Type', 'Rated']

    // Push all null values to end of array
    // We actually want them at the bottom of the array
    // null < 1, thus it is the lowest value, since we default to ascending order, this makes more sense
    if (!a[sortBy]) {
      // return 1;
      return -1;
    }
    if (!b[sortBy]) {
      // return -1
      return 1;
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

  function filterFuncV2(media: test) {
    function testNumber(key: string) {
      const min: boolean = media[key] ? media[key] <= filters['max' + key]
        : filters['min' + key] === getMinValue(key) // ? true : false
      const max: boolean = media[key] ? media[key] >= filters['min' + key]
        : filters['min' + key] === getMinValue(key) // ? true : false

      return min && max;
    }

    let result = true;
    Object.keys(columnsV2).forEach((column: string) => {
      console.log(result)
      if (column === 'Title') {
        media.Title.includes(filters.Title) ? undefined : result = false;
      } else if (columnsV2[column] === 'array') {
        filters[column].includes(media[column]) ? undefined : result = false;
      } else if (columnsV2[column] === 'number') {
        testNumber(column) ? undefined : result = false;
      }
    })

    return result;
  }

  function filterFunc(media: test) {
    const specialCases: { [key: string]: Function } = {
      // Every expression here should return true or false
      Title: () => media.Title.includes(filters.Title),
      Type: () => filters.Type.includes(media.Type),
      Rated: () => media.Rated ? filters.Rated.includes(media.Rated) : filters.Rated.includes(null) ? true : false,// false,
      minYear: () => media.Year >= filters.minYear,
      maxYear: () => media.Year <= filters.maxYear,
      minRuntime: () => media.Runtime ? media.Runtime >= filters.minRuntime : filters.minRuntime === getMinValue('Runtime') ? true : false,
      maxRuntime: () => media.Runtime ? media.Runtime <= filters.maxRuntime : true,
      minIMDBRating: () => media.IMDBRating ? media.IMDBRating >= filters.minIMDBRating : filters.minIMDBRating === getMinValue('IMDBRating') ? true : false, // false, // This will hide all N/A IMDBRatings
      maxIMDBRating: () => media.IMDBRating ? media.IMDBRating <= filters.maxIMDBRating : filters.minIMDBRating === getMinValue('IMDBRating') ? true : false,
      minRottenTomatoesRating: () => media.RottenTomatoesRating ? media.RottenTomatoesRating >= filters.minRottenTomatoesRating : filters.minRottenTomatoesRating === getMinValue('RottenTomatoesRating') ? true : false,
      maxRottenTomatoesRating: () => media.RottenTomatoesRating ? media.RottenTomatoesRating <= filters.maxRottenTomatoesRating : filters.maxRottenTomatoesRating === getMaxValue('RottenTomatoesRating') ? true : false,
      minMetacriticRating: () => media.MetacriticRating ? media.MetacriticRating >= filters.minMetacriticRating : filters.minMetacriticRating === getMinValue('MetacriticRating') ? true : false,
      maxMetacriticRating: () => media.MetacriticRating ? media.MetacriticRating <= filters.maxMetacriticRating : filters.minMetacriticRating === getMinValue('MetacriticRating') ? true : false,
    }
    let result = true;

    // for each media iterate over every key in special cases, if any of the test cases fail, return false
    // if it passes all tests, return true
    Object.keys(specialCases).forEach((key: string) => {
      // specialCases[key]() ? undefined : result = false && console.log(media.Title);
      if (!specialCases[key]()) {
        console.log(media.Title, 'failed due to', key)
        result = false
      }
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

        <FilterFromTo mediaKey='Year' absoluteMin={getMinValue('Year')} absoluteMax={getMaxValue('Year')} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='Runtime' absoluteMin={getMinValue('Runtime')} absoluteMax={getMaxValue('Runtime')} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='IMDBRating' absoluteMin={getMinValue('IMDBRating')} absoluteMax={getMaxValue('IMDBRating')} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='RottenTomatoesRating' absoluteMin={getMinValue('RottenTomatoesRating')} absoluteMax={getMaxValue('RottenTomatoesRating')} filters={filters} setFilters={setFilters} />
        <FilterFromTo mediaKey='MetacriticRating' absoluteMin={getMinValue('MetacriticRating')} absoluteMax={getMaxValue('MetacriticRating')} filters={filters} setFilters={setFilters} />

        <FilterCheckboxes selectors={getUnqValues('Type')} mediaKey='Type' filters={filters} setFilters={setFilters} />
        <FilterCheckboxes selectors={getUnqValues('Rated')} mediaKey='Rated' filters={filters} setFilters={setFilters} />
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
        {media.filter(filterFuncV2).sort(sortFunc).map((item: test) => {
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
