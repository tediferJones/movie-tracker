import prisma from '@/client';

export default async function Lists() {
  // How can we effeciently fetch all usernames?  That all we really need for this component
  // If the user has no list, we can just display nothing for their route
  const dbResult = await prisma.lists.findMany();
  // console.log(dbResult);
  const dbUsernames = dbResult.map((item: any) => item.username)
  // console.log(dbUsernames)
  const uniqueUsernames = [...new Set<string>(dbUsernames)]
  console.log(uniqueUsernames);

  return (
    <div>
      <h1>This is the lists page</h1>
      {uniqueUsernames.map((username: string) => {
        return (
          <div>
            <a href={`/lists/${username}`}>{username}</a>
          </div>
        )
      })}
    </div>
  )
}
