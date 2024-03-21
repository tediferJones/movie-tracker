// import { v4 as uuidv4 } from 'uuid';
import prisma from '@/client';

export default async function Lists() {
  const dbResult = await prisma.lists.groupBy({
    by: ['username']
  })
  console.log(dbResult);

  return (
    <div>
      <h1>This is the lists page</h1>
      {dbResult.map((item: { username: string }) => {
        return (
          <div className='m-4 p-4 bg-gray-700' key={item.username}>
            <a href={`/lists/${item.username}`}>{item.username}</a>
          </div>
        )
      })}
    </div>
  )
}
