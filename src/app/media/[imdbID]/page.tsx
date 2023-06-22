import DisplayFullMediaInfo from '@/components/DisplayFullMediaInfo';

export default async function Movie({ params }: { params: any }) {
  const { imdbID } = params;

  return (
    <div>
      {!imdbID ? <h1>Error: Either the database or omdbAPI are not responding</h1>
      : <>
        <DisplayFullMediaInfo imdbID={imdbID} />
      </>
      }
    </div>
  )
}
