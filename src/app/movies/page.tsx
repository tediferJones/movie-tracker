import { cleanMovieInfo } from '@/types';
import prisma from '@/client';

export default async function Movies() {
  // Use this page to show movies in our database, probably in order of cachedAt date

  const dbResults = await prisma.movie.findMany();
  // console.log(dbResults);

  return (
    <div>
      <h1>Multiple Movies Page</h1>
      <hr />
      <h1>Total movies in our database ( {dbResults.length} )</h1>
      {dbResults.map((item: cleanMovieInfo) => {
        return (
          <div className='flex justify-between'>
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
