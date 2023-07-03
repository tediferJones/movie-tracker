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

    const typeIsNumber = ['Year', 'Runtime', 'BoxOffice', 'imdbVotes', 'IMDBRating', 'RottenTomatoesRating', 'MetacriticRating'];

    const typeIsString = ['Title', 'Type', 'Rated']

    // IF VALUE IS NULL GIVE IT NEGATIVE INFINITY

    // These keys have type number
    if (typeIsNumber.includes(sortBy)) {
      // If an element doesnt exist (i.e. it is null or undefined), push to end of array
      // if (!a[sortBy]) {
      //   return -1
      // }
      return a[sortBy] - b[sortBy]
    }
    // These keys have type string
    if (typeIsString.includes(sortBy)) {
      console.log('sort by string')
      // if (!a[sortBy]) {
      //   console.log(`PUSH ${a['Title']} TO END`)
      //   // return -1
      //   a[sortBy] = ''
      // }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    // SORTING FUNCTION
    return 0
  }

  return (
    <div>
      <h1>SORT AND FILTER COMPONENT</h1>
      <div className='flex p-4 m-4'>
        <button className='flex-[3]' onClick={() => setSortBy('Title')}>Sort by title</button>
        <button className='flex-1' onClick={() => setSortBy('Year')}>Sort by year</button>
        <button className='flex-1' onClick={() => setSortBy('Type')}>Sort by type</button>
        <button className='flex-1' onClick={() => setSortBy('Rated')}>Sort by Rated</button>
        <button className='flex-1' onClick={() => setSortBy('Runtime')}>Sort by Runtime</button>
        <button className='flex-1' onClick={() => setSortBy('IMDBRating')}>Sort by IMDBRating</button>
        <button className='flex-1' onClick={() => setSortBy('RottenTomatoesRating')}>Sort by RottenTomatoesRating</button>
        <button className='flex-1' onClick={() => setSortBy('MetacriticRating')}>Sort by MetacriticRating</button>
        <button onClick={() => setReverseOrder(!reverseOrder)}>{reverseOrder ? 'Descending' : 'Ascending'}</button>
      </div>
      <div className={reverseOrder ? 'flex flex-col-reverse' : 'flex flex-col'}>
        {media.sort(sortFunc).map((item: media) => {
          return (
            <div className='flex justify-between p-4 m-4 bg-gray-700'
              key={item.imdbID}
            >
              <h3 className='flex-[3]'>{item.Title}</h3>
              <h3 className='flex-1 text-center'>{item.Year}</h3>
              <h3 className='flex-1 text-center'>{item.Type}</h3>
              <h3 className='flex-1 text-center'>{item.Rated}</h3>
              <h3 className='flex-1 text-center'>{item.Runtime} mins</h3>
              <h3 className='flex-1 text-center'>{item.IMDBRating ? item.IMDBRating / 10 : ''}</h3>
              <h3 className='flex-1 text-center'>{item.RottenTomatoesRating ? `${item.RottenTomatoesRating}%` : ''}</h3>
              <h3 className='flex-1 text-center'>{item.MetacriticRating ? `${item.MetacriticRating}/100` : ''}</h3>
              <a className='text-center'
                href={`/media/${item.imdbID}`}
              >LINK TO MOVIE</a>
            </div>
          )
        })}
      </div>

    </div>
  )
}
