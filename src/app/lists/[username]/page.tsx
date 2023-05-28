import DisplayMovieInfo from '@/components/DisplayMovieInfo';
import prisma from '@/client';

export default async function List({ params }: { params: any } ) {
  const { username } = params;
  const userList = await prisma.lists.findMany({ where: { username } })
  
  // Try using prisma.userList.groupBy() to fetch similar attributes (i.e. get all imdbIDs where username is tediferJones)
  // imdbID is the main thing we are trying to extract

  return (
    <div>
      <h1>USER LIST PAGE</h1>
      <h1>User list for: {username}</h1>
      {userList.map((item: any) => {
        return (
          <DisplayMovieInfo imdbID={item.imdbID} />
        )
      })}
    </div>
  )
} 
