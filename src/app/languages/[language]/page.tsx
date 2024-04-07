import TablePage from '@/components/tablePage';

export default function Language({ params }: { params: { language: string } }) {
  return <TablePage route='languages' propName={params.language}/>
}
