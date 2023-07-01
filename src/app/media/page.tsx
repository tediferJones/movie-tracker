// import { cleanMediaInfo } from '@/types';
import prisma from '@/client';
import { media } from '@prisma/client';
import SortFilterMedia from '@/components/SortFilterMedia';

export default async function Movies() {
  // Use this page to show movies in our database, probably in order of cachedAt date

  const dbResults: media[] = await prisma.media.findMany();
  // console.log(dbResults);
  //

  return (
    <div>
      <h1>Multiple Movies Page</h1>
      <hr />
      <h1>Total movies in our database ( {dbResults.length} )</h1>
      <SortFilterMedia media={dbResults}/>
    </div>
  )
}
