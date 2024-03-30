'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export default function ToggleTheme() {
  const { setTheme, resolvedTheme } = useTheme();
  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      aria-label='toggle theme'
    >
      <Sun className='dark:h-0 h-[1.2rem] dark:w-0 w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0' />
      <Moon className='h-0 dark:h-[1.2rem] w-0 dark:w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100' />
    </Button>
  )
}

