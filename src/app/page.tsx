import { currentUser } from '@clerk/nextjs';
import DisplayLists from '@/components/DisplayLists';
import ManageDefaultList from '@/components/ManageDefaultList';
import DisplayWatched from '@/components/DisplayWatched';
// import prisma from '@/client'

export default async function Home() {
  // USE OMDBAPI: https://www.omdbapi.com/
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

  // This would be a good place to have filters for movies in the list attached to "this" account
  //   For Example: 
  //      - Show recent movies added to my list
  //      - Pick a random movie for me
  //      - Show movies with rating above 6.0 and length less than 120 mins


  // The master TO-DO list
  //
  // Feature additions:
  //      FIELDS THAT ALMOST CERTAINLY EXISTS: mongoDB-ID, Title, Year, imdbID, Type, cachedAt 
  //
  //    - move auth from ./layout to individual components
  //      - if done properly, users can still browse/filter the whole DB, and search for movies
  //      - But if they try to do anything related a user (i.e. add/remove a movie some list), then require login
  //
  //    - Rewrite /movies page, each media type should have its own section, 
  //      i.e. 'Games' section will show all games in the DB
  //      INSTEAD: create pages for /media/games, /media/movies, 
  //      each page should display a SortFilterMedia component with only that type
  //      - Isn't this kind of redundant?  Could just use SortFilterMedia component, and filter all except 'movie' or whatever
  //
  //    - WRITE SOME TESTS, try to test most components and modules
  //      - Cant test things that fetch... all our components fetch so we're kinda boned
  //      - No point in testing pages, they are very simple anyways, and cant fetch from DB during tests so?
  //      
  //      SOLUTION:
  //      - We need to write end 2 end tests, end to end tests can access the DB and hopefully maybe can use fetch
  //      - Look at this guide for more info on testing: https://nextjs.org/docs/pages/building-your-application/optimizing/testing
  //
  //    - Setup/Post project to vercel, as we push changes to github the website should update
  //      - Vercel will use its own database, so make sure prisma schemas are correct before setup
  //
  //    - Consider editing ManageLists component, by default it should display all users list, and the button should be add or remove depending on if it exists or not
  //      - Eh this is kind of a bad idea, we're already displaying all lists the given media exists in
  //      - if user has 100 lists, it will always show a scroll bar, and thats kind of ugly
  //
  //    - See ManageLists component, consider merging mediaExistsInCurrentList and mediaExistsInAnyList in any list
  //      - resulting func: mediaExistsInList(key) => if (key) check that list, if no key, check all lists, return true or false
  //
  //    - Revisit ManageDefaultList at some point, try to clean it up
  //      - consider sticking all the state vars into one obj
  //        this will make the fetch request and overall logic much more clear
  //
  //    - Go back to CleanUpMovieInfo module and clean up where we add endYear, 
  //      - These additions seem messy and the style doesnt match rest of the file
  //
  //    - Revisit SortFilterMedia component, see comments at top of file for more info
  //      - [ DONE ] Make columns an optional prop, by default use the columns defined in /media/page
  //      - [ DONE ] Component will fail to render if Type or Rated is not included
  //      - [ DONE ] Make sure we only show filters for columns that are included, 
  //        As of now if we remove runtime from columns, it will still display filters for runtime
  //      - Clean up how filters are generated in this component
  //
  //    - Rewrite DisplayLists component to use SortFilterMedia component
  //      - We could do this but seems like it could easily get over complicated
  //      - [ DONE ] Consider giving each list its own page /lists/[username]/[listname] and display a SortFilterMedia component there
  //      - Add links to each list, should point to /lists/[username]/[listname]
  //
  //    - Add components to DisplayFullMediaInfo, like 'DisplayReviews' and 'DisplayInLists'
  //      - [ DONE ] DisplayReviews should show all reviews for a given imdbID
  //      - DisplayInLists should show something like 'This movie exists in X number of lists from Y number of users'
  //        - And if we want to get fancy, display links to each list
  //        - Edit API route so it can returns all list records with matching imdbID
  //
  //    - [ DONE ] Make a DisplayRecentlyWatched component,
  //      - [ DONE ] Should return array of all watch records with matching username, in order from newest to oldest
  //      - [ DONE ] Will also need to fetch imdbID from media table, so we at least know what the title is
  //      - [ DONE ] Should have a max height or only display 5 most recent results with a button to show 5 more results
  //
  //    - [ DONE ] Do we want users to be able to see other users movieReviews?
  //      - [ DONE ] As of now, lets say no
  //      - [ DONE ] But if we change our mind all we have to do is write a client component 
  //        this component should fetch all reviews with the same imdbID
  //
  //    - Edit modules/easyFetch, if no body is provided, just use an empty obj
  //      - and make body param optional
  //      THESE COMPONENT USE AN EMPTY BODY
  //      - ManageLists, ManageDefaultLists, displayWatched
  //
  //    - Consider converting DisplaySeasons and DisplayEpisodes to use our new DisplayDropDown component
  //      - Will have to nest a DisplayDropDown within another DisplayDropDown to emulate the current version
  //
  //    - Remove unknown console.logs in api routes, leave the basics like "media get request for ${imdbID}"
  //      - Server output/logs seem very cluttered
  //
  //    - Go to every page that takes params, and make sure params are defined with uriDecode, 
  //      THIS IS IMPORTANT, otherwise characters like spaces will be read as '%20'
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //      - Do we want to convert from mongoDB to some kind of SQL db? SQLite would be prefered, but mySQL is also an option
  //      - Remember all the reasons we switched to mongoDB, mainly the lack of foreign key constraints
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //    - Consider making all PUT and DELETE requests based on id and username(like /api/watched).  This makes API requests more restFUL
  //      - If we dont end up doing this, change the delete function in ManageWatched to match how we handle things everywhere else
  //    - Add proper type to sliderHandler func in ManageReview
  //    - DONT USE document.getElementByWHATEVER, use the React.useRef hook
  //    - Consider adding IDs to the HTML, HTML should be somewhat readable on its own
  //    - Add some transitions/animations for drop downs and loading state (see t3 stack tutorial for loading state example)
  //

  const user = await currentUser();
  // await prisma.media.deleteMany({});
  // await prisma.lists.deleteMany({});
  // await prisma.reviews.deleteMany({});
  // await prisma.watched.deleteMany({});

  return (
    <div>
      {!(user?.username) ? <h1>Error: you need to login</h1>
      : <div>
        <h1>THIS IS THE HOME PAGE</h1>
        <ManageDefaultList />
        <DisplayWatched />
        <div className='text-xl'>Hello, {user.username}</div>
        <DisplayLists username={user.username}/>
      </div>
      }
    </div>
  )
}
