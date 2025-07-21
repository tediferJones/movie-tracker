'use client'

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
import { Fragment, useEffect, useState } from 'react';
import Searchbar from '@/components/subcomponents/searchbar';
import ToggleTheme from '@/components/subcomponents/toggleTheme';
import { fromCamelCase } from '@/lib/formatters';
import { useUserData } from '@/context/userData';

export default function Header() {
  const userData = useUserData();

  // this needs to access a state value from userData in order to function correctly
  // as of now, useEffect only triggers after data has been synced
  // because we don't set the userData state until sync status has been verified
  const [isSynced, setIsSynced] = useState<boolean | null>(null);
  useEffect(() => {
    if (!userData.current) {
      setIsSynced(null);
      return;
    }
    setIsSynced(userData.current.isSynced);
    if (userData.current.isSynced) {
      setTimeout(() => setIsSynced(null), 1500);
    }
  }, [userData.current]);

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
          {userData.current &&
            <>
              {userData.current.username}
              <UserButton />
            </>
          }
          <ToggleTheme />
        </div>
      </div>
      {
        userData.current &&
          <div className={`animate-pulse w-full h-2  bg-gradient-to-b ${isSynced === null ? '' : isSynced ? 'from-green-500' : 'from-red-500'} sticky top-0`}></div>
      }
      <Searchbar />
    </>
  )
}
