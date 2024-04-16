import TablePage from '@/components/pages/tablePage';

export default function Language({ params }: { params: { language: string } }) {
  return <TablePage route='languages' propName={params.language}/>
}
