import { UserButton, currentUser } from '@clerk/nextjs';
import ToggleTheme from '@/components/toggleTheme';
import Searchbar from '@/components/searchbar';

export default async function Header() {
  // const { user } = useUser();
  const user = await currentUser();
  return (
    <>
      <div className='flex flex-col flex-wrap items-center gap-4 border-b-[1px] rounded-none px-8 py-4 sm:flex-row sm:justify-between'>
        <h1 className='text-nowrap text-2xl font-extrabold'>Movie Tracker</h1>
        <div className='flex items-center gap-4'>
          {user?.username}
          <UserButton />
          <ToggleTheme />
        </div>
      </div>
      <Searchbar />
    </>
  )
}
