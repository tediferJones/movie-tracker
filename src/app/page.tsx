import { currentUser } from '@clerk/nextjs';
import DisplayLists from '@/components/DisplayLists';
import ManageDefaultList from '@/components/ManageDefaultList';
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
  //      FIELDS THAT ALMOST CERTAINLY EXISTS: mongoDB-ID, Title, Year, imdbID, Type, cachedAt 
  //
  //    - move auth from ./layout to individual components
  //      - if done properly, users can still browse/filter the whole DB, and search for movies
  //      - But if they try to do anything related a user (i.e. add/remove a movie some list), then require login
  //
  //    - Do we want users to be able to see other users movieReviews?
  //      - As of now, lets say no
  //      - But if we change our mind all we have to do is write a client component 
  //        this component should fetch all reviews with the same imdbID
  //
  //    - Rewrite /movies page, each media type should have its own section, 
  //      i.e. 'Games' section will show all games in the DB
  //      INSTEAD: create pages for /media/games, /media/movies, 
  //      each page should display a SortFilterMedia component with only that type
  //
  //    - WRITE SOME TESTS, try to test most components and modules
  //      - Cant test things that fetch... all our components fetch so we're kinda boned
  //      - No point in testing pages, they are very simple anyways, and cant fetch from DB during tests so?
  //      - Seems like there is no point to testing this... but I would love to be proven wrong
  //
  //    - Setup/Post project to vercel, as we push changes to github the website should update
  //      - Vercel will use its own database, so make sure prisma schemas are correct before setup
  //
  //    - Error in ManageWatched Component (idk this kinda just started happening one day, if the issue disappears forget about this)
  //
  //    - Consider editing ManageLists component, by default it should display all users list, and the button should be add or remove depending on if it exists or not
  //      - Eh this is kind of a bad idea, we're already displaying all lists the given media exists in
  //      - if user has 100 lists, it will always show a scroll bar, and thats kind of ugly
  //
  //    - See ManageLists component, consider merging mediaExistsInCurrentList and mediaExistsInAnyList in any list
  //      - resulting func: mediaExistsInList(key) => if (key) check that list, if no key, check all lists, return true or false
  //
  //    - Make a Filter&SortMedia componenet, should take an array of objs as its type,
  //      - Dynamically infer the column names from the obj keys and add buttons to the top of each column that toggle sort ascending or descending
  //      - Then figure out how to do the filtering
  //      - A good place to setup/test this would be the /media page, its gunna be a big table that we want to be able to sort through
  //      - Sorting works, now start working on Filtering of media (actually removing certain results from the output)
  //
  //    - Revisit ManageDefaultList at some point, try to clean it up
  //      - consider sticking all the state vars into one obj
  //        this will make the fetch request and overall logic much more clear
  //
  //    - Prisma generates its own types, use those instead of our predefined types files, 
  //      these types should auto update as the schema changes
  //    - Move types from SortFilterMedia and sortFilterMediaUtils to types file
  //    - Search for review and watched types, these can be fulfilled by prisma types
  //    - Same goes for cleanMediaInfo type
  //    - CHANGE ALL REFERENCES FROM reviews type, to singular form, i.e. 'review' and use prisma type if possible
  //    - Delete "reviews" table once we have fully migrated to "review"
  //
  //    - Dont forget to delete LinkToMedia component
  //
  //    - Go back to CleanUpMovieInfo module and clean up where we add endYear, 
  //      - These additions seem messy and the style doesnt match rest of the file
  //
  //    - Revisit SortFilterMedia component, see comments at top of file for more info
  //
  //    - Make a DisplayRecentlyWatched component,
  //      - Should return array of all watch records with matching username, in order from newest to oldest
  //
  //    - Rewrite DisplayLists component to use SortFilterMedia component
  //
  //    - Remove delete request from /api/reviews
  //
  //    TO DO SOON:
  //      Get filtering working in SortFilterMedia component
  //      Migrate from our made-up types to prismas generated types
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //    - Consider making all PUT and DELETE requests based on id and username(like /api/watched).  This makes API requests more restFUL
  //      - If we dont end up doing this, change the delete function in ManageWatched to match how we handle things everywhere else
  //    - Add proper type to sliderHandler func in ManageReview
  //    - DONT USE document.getElementByWHATEVER, use the React.useRef hook
  //    - Consider adding ids to HTML, HTML should be somewhat readable on its own
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
        <div className='text-xl'>Hello, {user.username}</div>
        <DisplayLists username={user.username}/>
      </div>
      }
    </div>
  )
}
