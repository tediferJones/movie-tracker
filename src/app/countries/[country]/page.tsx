import TablePage from '@/components/pages/tablePage';

export default function Country({ params }: { params: { country: string } }) {
  return <TablePage route='countries' propName={params.country} />
}
