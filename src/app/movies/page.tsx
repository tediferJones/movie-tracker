import { cleanMovieInfo } from '@/types';
import prisma from '@/client';

export default async function Movies() {
  // Use this page to show movies in our database, probably in order of cachedAt date

  const dbResults = await prisma.movies.findMany();
  // console.log(dbResults);

  return (
    <div>
      <h1>Multiple Movies Page</h1>
      <hr />
      <h1>Total movies in our database ( {dbResults.length} )</h1>
      {dbResults.map((item: cleanMovieInfo) => {
        // This container div should probably have a key, but doesnt seem to throw any errors/warning
        return (
          <div className='flex justify-between'
            key={item.imdbID}
          >
            <h1 className='flex-1'>{item.Title}</h1>
            <h3 className='flex-1'>{item.Year}</h3>
            <a className='flex-1'
              href={`/movies/${item.imdbID}`}
            >LINK TO MOVIE</a>
          </div>
        )
      })}
    </div>
  )
}
