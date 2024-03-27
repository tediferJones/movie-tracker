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

// TO-DO
//
// - Create database tables and corresponding api routes
// - Copy over components folder from old project
// - Tweak standard classes in globals.css
//   - Buttons and anchor tags should have consistent padding and rounding
// - Copy basic manifest from password-manager, better to have this setup as early as possible
// - Work on simplifying searchbar
// - Make sure api always fetches long form of plot
// - Add foreign keys to table schemas, especially for imdbID,
//    - See here: https://orm.drizzle.team/docs/indexes-constraints#foreign-key
// - Remove id primary key from media table, use imdbId as primary key
// - Add foreign key constraints to imdbId column in all tables except media
//   - Try to enforce update/delete actions,
//     this way if we delete a movie from the media table, it should automatically delete all related entries
//     - This would primarily be useful for listnames and lists table,
//       when you delete a listname, delete all list items associated with that name
// - Get lists working
//   - Delete default list and listnames api routes, they shouldnt be needed any longer
//   - Delete listnames component if it is not used
// - Create UserLists component
//  - List all existing lists with links to each list's page
//  - Also allow user to set their default list here
//    - Store default list value in clerk public user info
// - Fix listManage component
//   - What happens if user adds a movie to a list that already contains that movie
// - Add input validation for client and server
// - Go to listManager component, try to merge fetch calls in useEffect hook
//   - This will also help simplify the associated api route
// - Fix reviewManager
//   - Watch again should not be null by default
//   - Rating slider should directly correlate to value on initial load
//     - Right now, default value is 0 but slider shows 100%

export default function Home() {
  return (
    <div>
      <DefaultListManager />
    </div>
  );
}
