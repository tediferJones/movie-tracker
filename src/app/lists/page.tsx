import { v4 as uuidv4 } from 'uuid';
import prisma from '@/client';

export default async function Lists() {
  const dbResult = await prisma.lists.groupBy({
    by: ['username']
  })
  // console.log(dbResult);

  return (
    <div>
      <h1>This is the lists page</h1>
      {dbResult.map((item: { username: string }) => {
        return (
          <div key={uuidv4()}>
            <a href={`/lists/${item.username}`}>{item.username}</a>
          </div>
        )
      })}
    </div>
  )
}
