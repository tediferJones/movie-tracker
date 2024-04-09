import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { UserButton, currentUser } from '@clerk/nextjs';
import ToggleTheme from '@/components/toggleTheme';
import Searchbar from '@/components/searchbar';
import { Menu } from 'lucide-react';
import Link from 'next/link';
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
                <Menu></Menu>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['media', 'people', 'genres', 'countries', 'languages'].map((category, i, arr) => {
                return (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/${category}`}>{fromCamelCase(category)}</Link>
                    </DropdownMenuItem>
                    {i < arr.length - 1 ? <DropdownMenuSeparator /> : []}
                  </>
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
