import DefaultListManager from '@/components/defaultListManager';

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
// - Get lists working
//   - Delete default list and listnames api routes, they shouldnt be needed any longer
//   - Delete listnames component if it is not used
// - Create UserLists component
//  - List all existing lists with links to each list's page
//  - Also allow user to set their default list here
//    - Store default list value in clerk public user info
// - Add input validation for client and server
// - Double check reviewManager works as intended
// - Add formatter module to src/lib, move formatters from mediaInfo to this new file
//   - This will be very useful later when we implement tables
// - Add ScrollArea to root of document
//   - Problem: scroll bar doesnt resize when page size changes
// - Clean up types file, remove types from old version
// - Consider extracting basicApi route to its own component
// - Consider adding mediaType column to table
// - Create mobile view for table
// - Create home page dashboard
//   - Show recently watched media
//   - Show table for default list
//     - Add selector to display any list
//   - Add a sidebar with links to all list pages
// - Create user page (should be similar to home page dashboard)
//   - Show all info related to this user like their lists, reviews, and watch records
// - Figure out how we're going to approach default lists
//   - Do we want to have a ranking system?  So that we auto select highest ranked available list
//   - Or do we stick with the easy method of having a single default list
//   - Regardless, /api/lists needs to somehow return what the default list is
// - Clean up comments in /api/lists
// - Delete app/lists/[username]/[listname]/page.tsx if we think its not going to be used

export default function Home() {
  return (
    <div className='w-4/5 m-auto'>
      <DefaultListManager />
    </div>
  );
}
