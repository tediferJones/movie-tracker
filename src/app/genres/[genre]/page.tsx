import TablePage from '@/components/tablePage';

export default function Genre({ params }: { params: { genre: string } } ) {
  return <TablePage route='genres' propName={params.genre} />
}
