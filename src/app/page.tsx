'use client'
import { ToggleTheme } from '@/components/toggleTheme';
import { UserButton, useUser } from '@clerk/nextjs';

// OLD NOTES
// See .env file for omdb API key
// Format: http://www.omdbapi.com/?apikey=<OMDB_APIKEY>&<ENTER SEARCH PARAMS HERE>
// Search Terms:
//    TITLE/ID LOOK-UP
//      i=IMDB-ID             Request by specific IMDB-ID, which would probably be pulled from some other request
//      t=SOMETHING           Request specific title
//      y=YEAR                Additional param
//    SEARCHING
//      s=SOMETHING           Request search of term (returns multiple, use this for searchbar)
//      y=YEAR                Additional param

// TO-DO
//
// - Create database tables and corresponding api routes
// - Copy over components folder from old project
// - Tweak standard classes in globals.css
//   - Buttons and anchor tags should have consistent padding and rounding

export default function Home() {
  const { user } = useUser();
  return (
    <div>
      <div className='flex flex-col flex-wrap items-center gap-4 border-b-[1px] px-8 py-4 sm:flex-row sm:justify-between'>
        <h1 className='text-nowrap text-2xl font-extrabold'>Movie Tracker</h1>
        <div className='flex items-center gap-4'>
          {user?.username}
          <UserButton />
          <ToggleTheme />
        </div>
      </div>
      <button className='rounded-lg bg-gray-300 px-4 py-2 font-medium dark:bg-gray-700'>
        TEST DARK MODE
      </button>
    </div>
  );
}
