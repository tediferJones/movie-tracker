import DisplayFullMediaInfo from '@/components/DisplayFullMediaInfo';

export default async function Movie({ params }: { params: { imdbID: string } }) {
  const imdbID = decodeURI(params.imdbID);

  return <DisplayFullMediaInfo imdbID={imdbID} />
}
