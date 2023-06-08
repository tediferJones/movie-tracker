import { currentUser } from '@clerk/nextjs';
import DisplayUserList from '@/components/DisplayUserList';
// import prisma from '@/client'

export default async function Home() {
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
  // General Notes to self:
  //    - Use easyFetch for all fetch requests, be consistent
  //    - Replace 2 line methods for fetching url params with the 1 line method (see /api/lists for examples)
  //    - Always be careful of the inputs we accept from the user, 
  //      Solution: just DONT use HTML value attribute to hold/pass important information, 
  //      
  //
  // Feature additions:
  //    - add more fields to the lists table? like 
  //        watched?      (bool) 
  //        myRating      (0-5 bags of popcorn), 
  //          - if we want 1-5 rating, the finest increment we can handle is 0.05
  //          - if we use a step of 0.05, that gives us 100 unique options between 0 and 5
  //          - This is perfect because can assign all rating values to a base of 100
  //          - i.e. all rating with valid step, can be multiplied by 20 to get an integer between 0 and 100
  //        watchAgain?   (bool)
  //    - Do we want users to have multiple lists?
  //      if we do consider spliting up lists table into lists and movieDetails
  //        - Lists table should link to movieDetails to get record matching this username and imdbID
  //        - This allows us to use one movie record in multiple lists
  //          i.e. if we have friday 13th in 2 different lists, they should present the same movieDetails
  //    - move auth from ./layout to individual components
  //      - if done properly, users can still browse/filter the whole DB, and search for movies
  //      - But if they try to do anything related a user (i.e. add/removing a movie a list), then require the login
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Try to remove the weird fake type coercion in /modules/CleanUpMovieInfo
  //      - Try adding a third type to the types file,
  //      - One type needs to be a pure version of rawMovieInfo, no optional fields
  //      - Second type need to be a transitional object, should have lots of optional fields
  //      - Third type is cleanMovieInfo, which is already pure
  //    - Make username, imdbID, and listName (if we add that) unique, 
  //      See 'defining a unique field' in prisma docs or search for @@unique
  //

  const user = await currentUser();
  // await prisma.movies.deleteMany({});
  // await prisma.lists.deleteMany({});

  return (
    <div>
      {!(user?.username) ? <h1>Error: you need to login</h1>
      : <div>
        <h1>THIS IS THE HOME PAGE</h1>
        <div className='text-xl'>Hello, {user.username}</div>
        <DisplayUserList username={user.username}/>
      </div>
      }
    </div>
  )
}
