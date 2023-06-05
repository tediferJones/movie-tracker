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
  //      Solution: just DONT use HTML value attribute to hold important information, 
  //      
  //
  // Feature additions:
  //    - add more fields to the lists table? like 
  //        watched?      (bool) 
  //        myRating      (0-5 bags of popcorn)
  //        watchAgain?   (bool)
  //
  //
  // Minor Changes:
  //    - Prisma still says more than 10 instances are running sometimes, we should probably try to address that
  //    - Update prisma schema, also update types file to match, 
  //      will probably also need to visit cleanUpMovieInfo component, to implement these changes
  //        - [ DONE ] Split country, language,  into array
  //        - [ DONE ] Fields to change to Number: Year, Runtime, imdbVotes, 
  //        - [ DONE ] Fields to change to date (UNIX time): Released, CachedAt, DVD
  //        - [ DONE ] Convert rating to numbers (could be int, they all out essentially out of 100 anyways)
  //        - Change BoxOffice to int
  //        - AFTER DONE UPDATING PRISMA SCHEMA: CLEAR THE DB OF ALL RECORDS
  //    - Change the way user list is stored, each user should have a single record that holds an array of movieIDs 
  //      - Make the username field unique in this table
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
