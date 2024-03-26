import ListnameManager from '@/components/listnameManager';

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
// - Media page needs the following components:
//   - Watch manager
//   - List manager
//   - Review manager
// - Add foreign keys to table schemas, especially for imdbID,
//    - See here: https://orm.drizzle.team/docs/indexes-constraints#foreign-key
// - Remove id primary key from media table, use imdbId as primary key
// - Add foreign key constraints to imdbId column in all tables except media
//   - Try to enforce update/delete actions,
//     this way if we delete a movie from the media table, it should automatically delete all related entries
//     - This would primarily be useful for listnames and lists table,
//       when you delete a listname, delete all list items associated with that name
// - Do we want users to be able to create a blank list?
//   - If we do, then we need to create another table and thus another api route
//   - Otherwise, listmanager also needs to be able to create new lists
// - Get lists working
//   - Delete default list and listnames api routes, they shouldnt be needed any longer
//   - Delete listnames component if it is not used
// - Create UserLists component
//  - List all existing lists with links to each list's page
//  - Also allow user to set their default list here
//    - Store default list value in clerk public user info

export default function Home() {
  return (
    <div>
      <ListnameManager />
    </div>
  );
}
