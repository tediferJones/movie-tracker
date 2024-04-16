import TablePage from '@/components/pages/tablePage';

export default function Genre({ params }: { params: { genre: string } } ) {
  return <TablePage route='genres' propName={params.genre} />
}
