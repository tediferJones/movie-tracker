'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Fragment } from 'react';
import Searchbar from '@/components/subcomponents/searchbar';
import ToggleTheme from '@/components/subcomponents/toggleTheme';
import { fromCamelCase } from '@/lib/formatters';
import { useSyncStatus, useUserData } from '@/context/userData';

export default function Header() {
  const userData = useUserData();
  const syncState = useSyncStatus();
  const syncClass = {
    notSynced: 'from-red-500',
    syncing: 'from-yellow-500',
    synced: 'from-green-500',
    '': '',
  }[syncState];

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
                    <DropdownMenuSeparator />
                  </Fragment>
                )
              })}
              <DropdownMenuItem>
                <button className='text-primary'
                  onClick={async () => {
                    const res = await fetch('/api/clearCache');
                    if (res.ok) localStorage.removeItem('media-tracker');
                  }}
                >
                  Reset Cache
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {userData.current &&
            <>
              <span onClick={() => fetch('/api/sync', { method: 'DELETE' })}>
                {userData.current.username}
              </span>
              <UserButton />
            </>
          }
          <ToggleTheme />
        </div>
      </div>
      <div className={`animate-pulse w-full h-2 bg-gradient-to-b ${syncClass} sticky top-0`}></div>
      <Searchbar />
    </>
  )
}
