'use client';

import { useState } from 'react';
import { media } from "@prisma/client";

// Move this to types file
interface test extends media {
  [key: string]: any
}

export default function SortFilterMedia({ media }: { media: media[] }) {
  console.log(media);
  const [sortBy, setSortBy] = useState<string>('')
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);

  // We need to determine how to handle null/undefined,
  // do we want to exclude those, or just push them to the end of the array?

  // What attributes do we want to be able to sort by?
  // Title
  // Year
  // Rated
  // Runtime
  // Awards? Can only really do "has awards" or 'doesnt have awards'
  // Type
  // DVD release? Seems kind of useless
  // BoxOffice, sort by profits
  // imdbVotes
  // IMDBRating
  // RottenTomatoesRating
  // MetacriticRating
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

  const columns = ['Title', 'Year', 'Type', 'Rated', 'Runtime', 'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating']

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <button onClick={() => setReverseOrder(!reverseOrder)}>Display Order:{reverseOrder ? 'Descending' : 'Ascending'}</button>
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
        {media.sort(sortFunc).map((item: test) => {
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
                  <>
                    {i > 0 ? <div className='w-0.5 bg-gray-400'></div> : []}
                    <h3 className={key === 'Title' ? 'flex-[3] text-center my-auto' : 'flex-1 text-center my-auto'}
                      key={`${item.imdbID}${key}`}
                    > {!item[key] ? 'N/A' 
                        : Object.keys(specialCases).includes(key) ? specialCases[key]()
                          : item[key]}
                    </h3>
                  </>
                )
              })}
            </a>
          )
        })}
      </div>
    </div>
  )
}
