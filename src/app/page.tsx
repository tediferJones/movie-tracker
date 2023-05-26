export default function Home() {
  // USE OMDBAPI: https://www.omdbapi.com/
  // apikey=8e1df54b
  // Format: http://www.omdbapi.com/?apikey=8e1df54b&<ENTER SEARCH PARAMS HERE>
  // Search Terms:
  //    TITLE/ID LOOK-UP
  //      i=IMDB-ID             Request by specific IMDB-ID, which would probably be pulled from some other request
  //      t=SOMETHING           Request specific title
  //      y=YEAR                Additional param
  //    SEARCHING
  //      s=SOMETHING           Request search of term (returns multiple, use this for searchbar)
  //      y=YEAR                Additional param

  // How to delay fetch until user is done typing: 
  // https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing

  // This would be a good place to have filters for movies in the list attached to "this" account
  //   For Example: 
  //      - Show recent movies added to my list
  //      - Pick a random movie for me
  //      - Show movies with rating above 6.0 and length less than 120 mins


  // The master TO-DO list
  //
  // Feature additions:
  //    - Add page for /list/[username], should display the list associated with their username
  //      - You will also need to update all fetch requests that send data to the old routes
  //    - Add page for /list/ this should show all users who have a list, and link to their list page
  //
  // Typos/Minor Changes:
  //    - Rename api routes, to api/movie/ and api/list/, this is more restful and consistent with our page structure
  //    - Fix imdbId typo in addToMyList, should be imdbID instead
  //      - The same imdbId typo exists in prismaSchema for userLists, fix that
  //    - Fix updateCachedMovie file to use capital letter, fix all imports of this component too
  //    - Change /app/movies/[id] to /app/movies/[imdbID], this more accurate and easier to understand from a distance
  //    - Change runtime in prismaSchema and Types file to a number, cant sort by runtime if runtime is a string
  //        - i.e. how do you sort ['128 mins', '240 mins', '90 mins' ], its much easier to sort [128, 90, 240]
  //    - Take a look at /lists/page.tsx, find a more efficient way of obtaining unique array of usernames in db.userLists
  //
  
  return (
    <div>
      <h1>THIS IS THE HOME PAGE</h1>
    </div>
  )
}
