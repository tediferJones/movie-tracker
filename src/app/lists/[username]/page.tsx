import DisplayUserList from '@/components/DisplayUserList';

export default async function List({ params }: { params: any } ) {
  const { username } = params;
  
  return (
    <div>
      <h1>USER LIST PAGE</h1>
      <h1>User list for: {username}</h1>
      <DisplayUserList username={username}/>
    </div>
  )
} 
