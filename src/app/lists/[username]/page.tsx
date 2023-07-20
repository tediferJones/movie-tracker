import DisplayLists from '@/components/DisplayLists';

export default async function List({ params }: { params: any } ) {
  const username = decodeURI(params.username)
  
  return (
    <div>
      <h1>User lists for: {username}</h1>
      <DisplayLists username={username}/>
    </div>
  )
} 
