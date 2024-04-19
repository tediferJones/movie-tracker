import DefaultListManager from '@/components/subcomponents/defaultListManager';
import GetBreadcrumbs from '@/components/subcomponents/getBreadcrumbs';
import UserPage from '@/components/pages/userPage';
import { currentUser } from '@clerk/nextjs/server';

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
//
// APIs for streaming info:
//  https://www.movieofthenight.com/about/api (free tier 100 requests per day, but that's 3100 per month)
//  https://api.watchmode.com/#pricing (free tier 1000 requests per month)

// Future Ideas
//
// - Work on simplifying searchbar
// - Make sure api always fetches long form of plot
// - Consider extracting basicApi route to its own component
// - Consider re-designing how we handle default lists
//   - It might be nice if lists could be ranked, instead of just having a single default list
// - Consider adding mediaType column to table

// TO-DO
//
// - Clean up extraneous comments and console.log statements
//   - Delete server side console.logs too
// - Work through lighthouse issues on larger pages
//   - i.e. user page, media page and media table page, people/[person] page
// - [ DONE ] Copy basic manifest from password-manager, better to have this setup as early as possible
//   - [ DONE ] Find a favicon, make sure we get the proper formats for the manifest too
//   - [ DONE ] use https://realfavicongenerator.net to get all neccessary favicon sizes
// - [ DONE ] Make trashcan icon in watchManager a button, and add accessible name
// - Fix goofy padding at bottom of accordion content in people/[person] page
//   - Looks like it's supposed to be that way
// - Delete comments from manifest.ts

export default async function Home() {
  const user = await currentUser();
  return !user?.username ? <div>Error you're not logged in</div> :
    <div className='w-4/5 m-auto flex flex-col gap-4 mb-8'>
      <GetBreadcrumbs links={{ home: '/', users: '/users', [user.username]: `/users/${user.username}` }}/>
      <UserPage username={user.username}>
        <DefaultListManager />
      </UserPage>
    </div>
}
