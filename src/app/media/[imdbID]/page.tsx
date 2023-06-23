import DisplayFullMediaInfo from '@/components/DisplayFullMediaInfo';

export default async function Movie({ params }: { params: any }) {
  // If no params exist, server should render /media instead, 
  // and if imdbID doesnt exist in DB, the component will show the user an error dialog
  const { imdbID } = params;

  return <DisplayFullMediaInfo imdbID={imdbID} />
}
