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
    minIMDBRating: getMinValue('IMDBRating'),
    maxIMDBRating: getMaxValue('IMDBRating'),
    minRottenTomatoesRating: getMinValue('RottenTomatoesRating'),
    maxRottenTomatoesRating: getMaxValue('RottenTomatoesRating'),
    minMetacriticRating: getMinValue('MetacriticRating'),
    maxMetacriticRating: getMaxValue('MetacriticRating'),
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
    return result.sort();
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
      Rated: () => media.Rated ? filters.Rated.includes(media.Rated) : false,
      minYear: () => media.Year >= filters.minYear,
      maxYear: () => media.Year <= filters.maxYear,
      minRuntime: () => media.Runtime ? media.Runtime >= filters.minRuntime : filters.minRuntime === getMinValue('Runtime') ? true : false,
      maxRuntime: () => media.Runtime ? media.Runtime <= filters.maxRuntime : true,
      minIMDBRating: () => media.IMDBRating ? media.IMDBRating >= filters.minIMDBRating : false, // This will hide all N/A IMDBRatings
      maxIMDBRating: () => media.IMDBRating ? media.IMDBRating <= filters.maxIMDBRating : false,
      minRottenTomatoesRating: () => media.RottenTomatoesRating ? media.RottenTomatoesRating >= filters.minRottenTomatoesRating : filters.minRottenTomatoesRating === getMinValue('RottenTomatoesRating') ? true : false,
      maxRottenTomatoesRating: () => media.RottenTomatoesRating ? media.RottenTomatoesRating <= filters.maxRottenTomatoesRating : filters.maxRottenTomatoesRating === getMaxValue('RottenTomatoesRating') ? true : false,
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
        <div className='text-white'>Year Filter:</div>
        <input type='number' step={1} min={Math.min(...media.map(item => item.Year))} max={filters.maxYear} value={filters.minYear} onChange={(e) => setFilters({ ...filters, minYear: Number(e.target.value) })}/>
        <input type='number' step={1} min={filters.minYear} max={Math.max(...media.map(item => item.Year))} value={filters.maxYear} onChange={(e) => setFilters({ ...filters, maxYear: Number(e.target.value) })}/>

        <div className='text-white'>Runtime Filter</div>
        <input type='number' step={1} min={getMinValue('Runtime')} max={filters.maxRuntime} value={filters.minRuntime} onChange={(e) => setFilters({ ...filters, minRuntime: Number(e.target.value) })}/>
        <input type='number' step={1} min={filters.minRuntime} max={getMaxValue('Runtime')} value={filters.maxRuntime} onChange={(e) => setFilters({ ...filters, maxRuntime: Number(e.target.value) })}/>

        <div className='text-white'>IMDBRating Filter</div>
        <input type='number' step={0.1} min={getMinValue('IMDBRating') / 10} max={filters.maxIMDBRating / 10} value={(filters.minIMDBRating / 10).toFixed(1)} onChange={(e) => setFilters({ ...filters, minIMDBRating: Number(e.target.value) * 10 })}/>
        <input type='number' step={0.1} min={filters.minIMDBRating / 10} max={getMaxValue('IMDBRating') / 10} value={(filters.maxIMDBRating / 10).toFixed(1)} onChange={(e) => setFilters({ ...filters, maxIMDBRating: Number(e.target.value) * 10 })}/>

        <div className='text-white'>Rotten Tomatoes Rating Filter</div>
        <input type='number' step={1} min={getMinValue('RottenTomatoesRating')} max={filters.maxRottenTomatoesRating} value={filters.minRottenTomatoesRating} onChange={(e) => setFilters({ ...filters, minRottenTomatoesRating: Number(e.target.value) })} />
        <input type='number' step={1} min={filters.minRottenTomatoesRating} max={getMaxValue('RottenTomatoesRating')} value={filters.maxRottenTomatoesRating} onChange={(e) => setFilters({ ...filters, maxRottenTomatoesRating: Number(e.target.value) })} />

        <div className='text-white'>Metacritic Rating Filter</div>
        <input type='number' step={1} min={getMinValue('MetacriticRating')} max={filters.maxMetacriticRating} value={filters.minMetacriticRating} onChange={(e) => setFilters({ ...filters, minMetacriticRating: Number(e.target.value) })}/>
        <input type='number' step={1} min={filters.minMetacriticRating} max={getMaxValue('MetacriticRating')} value={filters.maxMetacriticRating} onChange={(e) => setFilters({ ...filters, maxMetacriticRating: Number(e.target.value) })}/>

        {JSON.stringify(filters.minIMDBRating)}
        {/*
        <input name='movie' type='checkbox' defaultChecked={true} onChange={(e) => e.target.checked ? setFilters({ ...filters, Type: filters.Type.concat('movie') }) : setFilters({ ...filters, Type: filters.Type.filter((type: string) => type !== 'movie')})}/>
        <label htmlFor='movie' className='text-white'>Movies</label>
        */}

        <div>
          {getUnqValues('Type').map((type: string) => {
              return (
                <div key={type}>
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
                </div>
              )
            })}
        </div>

        <div className='text-white'>
          {getUnqValues('Rated').map((rating: string) => {
            return (
              <div key={rating}>
                <label htmlFor={rating}>
                  <input name={rating} type='checkbox' defaultChecked={true}
                    onChange={(e) => e.target.checked 
                      ? setFilters({ ...filters, Rated: filters.Rated.concat(rating) }) 
                      : setFilters({ ...filters, Rated: filters.Rated.filter((existingRating: string) => existingRating !== rating)})
                    }
                  />
                  {rating}
                </label>

              </div>
            )
          })}
        </div>

        {/*
        <div className='text-white'>
          {JSON.stringify(filters.Rated)}
        </div>
        */}
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
