import prisma from '@/client';
import { media } from '@prisma/client';
import SortFilterMedia from '@/components/SortFilterMedia';

export default async function Movies() {
  const dbResults: media[] = await prisma.media.findMany();

  return (
    <div>
      <h1>Multiple Movies Page</h1>
      <hr />
      <h1>Total movies in our database ( {dbResults.length} )</h1>
      <SortFilterMedia mediaArr={dbResults} columns={{
        Title: 'string',
        Type: 'array',
        Rated: 'array',
        Year: 'number',
        Runtime: 'number',
        IMDBRating: 'number',
        RottenTomatoesRating: 'number',
        MetacriticRating: 'number',
      }}/>
    </div>
  )
}
