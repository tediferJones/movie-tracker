import DefaultListManager from '@/components/defaultListManager';
import UserPage from '@/components/userPage';
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

// TO-DO
//
// - Copy basic manifest from password-manager, better to have this setup as early as possible
// - Work on simplifying searchbar
// - Make sure api always fetches long form of plot
// - Add input validation for client and server
// - Clean up types file, remove types from old version
// - Consider extracting basicApi route to its own component
// - Consider adding mediaType column to table
// - Create mobile view for table
// - Consider re-designing how we handle default lists
//   - It might be nice if lists could be ranked, instead of just having a single default list
// - Clean up comments in 
//   - /api/lists
//   - /components/mediaInfo
// - Add footer for omdb attribution
// - Clean up extranious comments and console.log statements
// - Work through lighthouse issues on larger pages
//   - i.e. user page, media page and media table page
// - Move trashcan icon in listManager to far right side
//   - This should mimic watchManager and defaultListManager

export default async function Home() {
  const user = await currentUser();
  return (
    !user?.username ? <div>Error you're not logged in</div> :
      <div className='w-4/5 m-auto flex flex-col gap-4 mb-8'>
        <UserPage username={user.username}>
          <DefaultListManager />
        </UserPage>
      </div>
  );
}
