import DisplayFullMovieInfo from '@/components/DisplayFullMovieInfo';

export default async function Movie({ params }: { params: any }) {
  const { imdbID } = params;

  return (
    <div>
      {!imdbID ? <h1>Error: Either the database or omdbAPI are not responding</h1>
      : <>
        <h1>SINGLE MOVIE PAGE</h1>
        <DisplayFullMovieInfo imdbID={imdbID} />
      </>
      }
    </div>
  )
}
