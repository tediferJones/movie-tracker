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
  // Major additions:
  //    - move auth from ./layout to individual components
  //      - if done properly, users can still browse/filter the whole DB, and search for movies
  //      - But if they try to do anything related a user (i.e. add/remove a movie some list), then require login
  //    - Add a testing framework and write some tests
  //      - More info: https://nextjs.org/docs/pages/building-your-application/optimizing/testing
  //      - I think we need to write E2E tests, or just find some way to mock data from props or fetch requests
  //      - Or maybe integration tests?  if it hits the DB it should probably be an integration test (if I recall correctly)
  //    - Post our project to Vercel, setup a seperate DB for production
  //
  //
  // Feature additions:
  //    - Consider editing ManageLists component, by default it should display all users list, and the button should be add or remove depending on if it exists or not
  //      - Eh this is kind of a bad idea, we're already displaying all lists the given media exists in
  //      - if user has 100 lists, it will always show a scroll bar, and thats kind of ugly
  //
  //    - Remove unknown console.logs in api routes, leave the basics like "media get request for ${imdbID}"
  //      - Server output/logs seem very cluttered
  //
  //    - Add a refresh trigger to DisplayFullMediaInfo component,
  //      - We want this trigger to be able to cause child components to refresh
  //        For Example: When we update/submit our review, the component that displays all reviews should also refresh
  //
  //    - DisplayMediaLists, if lists are from a single user, dont display 'in 5 lists from 1 user', display 'in 5 lists from tedifer_jones'
  //
  //    - Try to move contents of DisplayFullMediaInfo component into /media/[imdbID] page, try to make it render serverside
  //      - If we can pull that off, try to do the same for the other pages
  //
  //    - SortFilterMedia component, consider using a nested object by type, like { string: ..., array: ..., }
  //      - This will allow us to remove the any type when setting initial filter state
  //
  //    - Try to simplify ManageLists component, still seems a bit too complicated for what its doing
  //
  //    - DO SOME STYLING
  //
  //
  //
  // Minor additions:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //      - Do we want to convert from mongoDB to some kind of SQL db? SQLite would be prefered, but mySQL is also an option
  //      - Remember all the reasons we switched to mongoDB, mainly the lack of foreign key constraints
  //    - Consider making all PUT and DELETE requests based on id and username(like /api/watched).  This makes API requests more restFUL
  //      - If we dont end up doing this, change the delete function in ManageWatched to match how we handle things everywhere else
  //    - Add proper type to sliderHandler func in ManageReview
  //    - DONT USE document.getElementByWHATEVER, use the React.useRef hook
  //    - Consider adding IDs to the HTML, HTML should be somewhat readable on its own
  //    - Add some transitions/animations for drop downs and loading state (see t3 stack tutorial for loading state example)
  //    - Conside replacing all <a> tags with <Link> tags, this is 'the react way'
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
