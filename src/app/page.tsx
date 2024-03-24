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
// - Store default list in clerk public data

export default function Home() {
  return (
    <div>
      <button className='px-4 py-2 font-medium colorPrimary'>
        TEST DARK MODE
      </button>
    </div>
  );
}
