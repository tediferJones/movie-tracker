import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import UserPage from '@/components/pages/userPage';
import { currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  const user = await currentUser();
  return !user?.username ? <div>Error you're not logged in</div> :
    <div className='w-4/5 m-auto flex flex-col gap-4 mb-8'>
      <GetBreadcrumbs links={{
        home: '/',
        users: '/users',
        [user.username]: `/users/${user.username}`
      }}/>
      <UserPage username={user.username} useDefaultListManager />
    </div>
}
