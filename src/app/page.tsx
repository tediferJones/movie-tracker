import DefaultListManager from '@/components/defaultListManager';
import { Button } from '@/components/ui/button';

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
// - Double check reviewManager works as intended
// - Add formatter module to src/lib, move formatters from mediaInfo to this new file
//   - This will be very useful later when we implement tables
// - Create Seasons dropdowns from media of type series or episodes
// - Add update function to mediaInfo
//   - Requires PUT route in /api/media
// - Add defaultList column to lists table
//   - Consider breaking lists table into a seperate tables
//      - listnames = { username, listname, isDefault }
//      - listItems = imdbId + FOREIGN KEY TO LISTNAMES TABLE
// - Use shadcn-ui scroll area for fancy scroll bars
// - Get rid of last await in /api/search

export default function Home() {
  return (
    <div>
      <DefaultListManager />
      <Button variant='destructive'>Shadcn button test</Button>
    </div>
  );
}
