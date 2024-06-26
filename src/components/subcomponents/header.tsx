import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { UserButton, currentUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Fragment } from 'react';
import Searchbar from '@/components/subcomponents/searchbar';
import ToggleTheme from '@/components/subcomponents/toggleTheme';
import { fromCamelCase } from '@/lib/formatters';

export default async function Header() {
  const user = await currentUser();
  return (
    <>
      <div className='flex flex-col flex-wrap items-center gap-4 border-b-[1px] rounded-none px-8 py-4 sm:flex-row sm:justify-between'>
        <a href='/' className='text-nowrap text-2xl font-extrabold'>Movie Tracker</a>
        <div className='flex items-center gap-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <span className='sr-only'>Menu Page</span>
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['media', 'users', 'people', 'genres', 'countries', 'languages'].map((category, i, arr) => {
                return (
                  <Fragment key={category}>
                    <DropdownMenuItem asChild>
                      <Link href={`/${category}`}>{fromCamelCase(category)}</Link>
                    </DropdownMenuItem>
                    {i < arr.length - 1 ? <DropdownMenuSeparator /> : []}
                  </Fragment>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {user?.username}
          <UserButton />
          <ToggleTheme />
        </div>
      </div>
      <Searchbar />
    </>
  )
}
